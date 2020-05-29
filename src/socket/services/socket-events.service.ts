import { Injectable } from '@nestjs/common';
import { SocketStateService } from './socket-state.service';
import { DriverFinder } from '../utils/socket-driver-finder';
import { RideRequest, RideRequestDocument } from '../../shared/models/ride-request';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DriverDocument, UserDocument } from '../../shared/models/user';
import { TripDocument, TripDocumentPopulated } from '../../shared/models/trip';
import { finalize, map, tap, timeInterval } from 'rxjs/operators';
import { SocketUtilsService } from './socket-utils.service';
import { EmptyError, merge, Observable, of, throwError } from 'rxjs';
import { LngLat } from '../../shared/models/location';
import { handleRetry } from '@nestjs/mongoose/dist/common/mongoose.utils';
import { SocketStateContainer } from '../handler/socket-event.handler';
import { WsResponse } from '@nestjs/websockets';
import { TripInvalidHandshakeException } from '../../shared/exceptions/socket/trip.exception';

@Injectable()
export class SocketEventsService {

  constructor(
    private socketStateService: SocketStateService,
    private socketUtilsService: SocketUtilsService,
  ) {

  }

  findDriverForTrip(rideRequest: RideRequest): Observable<RideRequestDocument> {
    const driverFinder = this.socketUtilsService.createDriverFinder();
    const riderSocketState = this.socketStateService.get(rideRequest.rider.id);
    riderSocketState.currentDriverFinder = driverFinder;
    return driverFinder.find(rideRequest, {
      maxDistance: 500000,
      maxDrivers: 10,
      maxRequestsAtOnce: 5,
      tryNextDriverAfterNumOfFailedRequests: 1,
      handshakeTimeout: 30000
    }).pipe(finalize(() => riderSocketState.currentDriverFinder = null));
  }

  sendDriverLocationToRider(riderId: string, lngLat: LngLat) {
    const riderSocketState = this.socketStateService.get(riderId);
    riderSocketState.handlers.forEach(handler => {
      handler.sendDriverLocationToRider(lngLat);
    });
  }
  
  tripHandshake(socketState: SocketStateContainer) {
    const {currentDriverFinder , user} = socketState;
    if (!currentDriverFinder) {
      return throwError(new TripInvalidHandshakeException())
    }

  }

}
