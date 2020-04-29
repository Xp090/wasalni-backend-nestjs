import { Injectable } from '@nestjs/common';
import { SocketStateService } from './socket-state.service';
import { DriverFinder } from '../utils/socket-driver-finder';
import { RideRequest, RideRequestDocument } from '../../shared/models/ride-request';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DriverDocument, UserDocument } from '../../shared/models/user';
import { TripDocument, TripDocumentPopulated } from '../../shared/models/trip';
import { map, tap } from 'rxjs/operators';
import { SocketUtilsService } from './socket-utils.service';
import { merge, Observable, of } from 'rxjs';
import { LngLat } from '../../shared/models/location';
import { handleRetry } from '@nestjs/mongoose/dist/common/mongoose.utils';
import { SocketStateContainer } from '../handler/socket-event.handler';

@Injectable()
export class SocketEventsService {

  constructor(
    private socketStateService: SocketStateService,
    private socketUtilsService: SocketUtilsService,
  ) {

  }

  findDriverForTrip(rideRequest: RideRequest): Observable<TripDocumentPopulated> {
    const driverFinder = this.socketUtilsService.createDriverFinder();
    const riderSocketState = this.socketStateService.get(rideRequest.rider.id);
    riderSocketState.currentDriverFinder = driverFinder;
    return driverFinder.find(rideRequest, {
      maxDistance: 500000,
      maxDrivers: 10,
      maxRequestsAtOnce: 5,
      tryNextDriverAfterNumOfFailedRequests: 1,
    }).pipe(tap({
      complete: () => riderSocketState.currentDriverFinder = null,
    }));
  }

  sendDriverLocationToRider(riderId: string, lngLat: LngLat) {
    const riderSocketState = this.socketStateService.get(riderId);
    riderSocketState.handlers.forEach(handler => {
      handler.sendDriverLocationToRider(lngLat);
    });
  }


  tripHandshake(socketState: SocketStateContainer<DriverDocument>) {
    const {currentTrip , user} = socketState;
    if (!currentTrip) {
      return of(false);
    }

    const riderSocketState = this.socketStateService.get(currentTrip.rideRequest.rider.id)
    if (!riderSocketState || !riderSocketState.handlers || riderSocketState.handlers.size == 0) {
      return of(false);
    }
    return riderSocketState.callHandlersForResult(handler => handler.handshakeTripWithRider(user))
      .pipe(tap())


  }

}
