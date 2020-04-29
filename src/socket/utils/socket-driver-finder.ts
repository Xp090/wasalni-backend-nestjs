import { DriverDocument } from '../../shared/models/user';
import { TripDocument, TripDocumentPopulated } from '../../shared/models/trip';
import {
  RideDriverResponse,
  RideRequest,
  RideRequestDocument,
} from '../../shared/models/ride-request';
import { Subject } from 'rxjs';
import { SocketStateService } from '../services/socket-state.service';
import { Model } from 'mongoose';
import { GeoPointDB, LngLat } from '../../shared/models/location';
import { UserService } from '../../shared/services/user/user.service';
import { RideRequestService } from '../../shared/services/ride-request/ride-request.service';
import { TripService } from '../../shared/services/trip/trip.service';


export class DriverFinder {


  protected _foundDriver: DriverDocument = null;
  protected _isCanceled = false;

  protected currentRequests = 0;
  protected failedRequests = 0;
  protected availableDrivers: DriverDocument[];


  protected sentRideRequest: RideRequestDocument = null;

  protected _tripRideRequest$ = new Subject<TripDocumentPopulated>();

  public config: DriverFinderConfig = null;

  constructor(private socketStateService: SocketStateService,
              private userService: UserService,
              private rideRequestService: RideRequestService,
              private tripService: TripService) {

  }


  find(rideRequest: RideRequest, config: DriverFinderConfig) {
    this.initFinding(rideRequest, config).then();
    return this._tripRideRequest$.asObservable();
  }


  cancel() {
    this._isCanceled = true;
    this.sentRideRequest.requestStatus = RideDriverResponse.RequestCanceledByRider;
    this.sentRideRequest.save();
  }

  protected async initFinding(rideRequest: RideRequest, config: DriverFinderConfig) {
    this.config = config;
    this.sentRideRequest = await this.rideRequestService.createRideRequest(rideRequest);
    this.availableDrivers = await this.getDriversDocuments({
      startPoint: rideRequest.rider.location,
      maxDistance: config.maxDistance,
      maxDrivers: config.maxDrivers,
    });
    return this.tryNextDrivers();
  }

  protected async getDriversDocuments(options: DriversQueryOptions) {
    return this.userService.getDrivers({
      location: {
        $nearSphere: {
          $geometry: options.startPoint,
          $maxDistance: options.maxDistance,
        },
      },
    }, options.maxDrivers);
  }

  protected async tryNextDrivers() {

    if (this.currentRequests == 0
      || this.failedRequests >= this.config.tryNextDriverAfterNumOfFailedRequests) {
      const currentDrivers = this.availableDrivers
        .splice(0, this.config.maxRequestsAtOnce - this.currentRequests);
      this.failedRequests = 0;
      if (currentDrivers.length > 0) {
        this.sendRequests(currentDrivers);
      } else {
        this.onFindingFailed('no_driver_found');
      }

    }
  }


  protected sendRequests(drivers: DriverDocument[]) {
    for (const driver of drivers) {
      if (this.isDriverFound || this.isCanceled) {
        break;
      }
      this.currentRequests++;
      this.updateSentRequestStatus(driver);
      const driverSocketState = this.socketStateService.get(driver.id);

      if (driverSocketState) {
        driverSocketState.handlers.forEach(driverHandler => {
          driverHandler.sendTripRequestToDriver(this.sentRideRequest)
            .subscribe(didAccept => {
              if (didAccept) {
                this.onDriverAccepted(driver);
              } else {
                this.onDriverDeclined(driver);
              }
            }, err => {
              this.onDriverTimeout(driver);
            });
        });
      } else {
        this.onDriverTimeout(driver);
      }

    }
  }

  protected onDriverAccepted(driver: DriverDocument) {
    if (!this.isDriverFound && !this.isCanceled) {
      this._foundDriver = driver;
      this.currentRequests--;
      this.updateSentRequestStatus(driver, RideDriverResponse.RequestAcceptedByDriver);
      this.onFindingDone(driver);
    } else {
      this.updateSentRequestStatus(driver,
        this.isCanceled ? RideDriverResponse.RequestCanceledByRider : RideDriverResponse.RequestTimedOut);
    }

  }

  protected onDriverDeclined(driver: DriverDocument) {
    this.failedRequests++;
    this.currentRequests--;
    this.updateSentRequestStatus(driver, RideDriverResponse.RequestDeclinedByDriver);
    this.tryNextDrivers();
  }

  protected onDriverTimeout(driver: DriverDocument) {
    this.failedRequests++;
    this.currentRequests--;
    this.updateSentRequestStatus(driver, RideDriverResponse.RequestTimedOut);
    this.tryNextDrivers();
  }

  protected async onFindingDone(acceptedDriver: DriverDocument) {
    this.sentRideRequest.requestStatus = RideDriverResponse.RequestAcceptedByDriver;
    this.sentRideRequest.driver = acceptedDriver;
    this.sentRideRequest.save();
    const trip = await this.tripService.createTrip(this.sentRideRequest);
    this._tripRideRequest$.next(trip);
    this._tripRideRequest$.complete();

  }

  protected onFindingFailed(err: any) {
    if (!this.isDriverFound || !this.isCanceled) {
      this.sentRideRequest.requestStatus = RideDriverResponse.RequestTimedOut;
      this.sentRideRequest.save();
      this._tripRideRequest$.error(err);
      this._tripRideRequest$.complete();
    }
  }

  private updateSentRequestStatus(driver: DriverDocument, response?: RideDriverResponse) {
    const sentRequest = this.sentRideRequest.requestsSent.get(driver.id) || {
      driver: driver,
    };
    if (response) {
      sentRequest.response = response;
      sentRequest.responseDate = new Date();
    }
    this.sentRideRequest.requestsSent.set(driver.id, sentRequest);
  }

  get isDriverFound() {
    return !!this.foundDriver;
  }

  get foundDriver() {
    return this._foundDriver;
  }

  get isCanceled() {
    return this._isCanceled;
  }
}

export interface DriversQueryOptions {
  startPoint: GeoPointDB,
  maxDistance: number,
  maxDrivers: number
}

export interface DriverFinderConfig {
  maxDistance: number,
  maxDrivers: number,
  maxRequestsAtOnce: number,
  tryNextDriverAfterNumOfFailedRequests: number
}
