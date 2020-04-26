import { Injectable } from '@nestjs/common';
import { SocketStateService } from './socket-state.service';
import { DriverFinder } from '../utils/socket-driver-finder';
import { RideRequest, RideRequestDocument } from '../../shared/models/ride-request';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DriverDocument, UserDocument } from '../../shared/models/user';
import { TripDocument, TripDocumentPopulated } from '../../shared/models/trip';
import { map } from 'rxjs/operators';
import { SocketUtilsService } from './socket-utils.service';
import { Observable } from 'rxjs';
import { LngLat } from '../../shared/models/location';
import { handleRetry } from '@nestjs/mongoose/dist/common/mongoose.utils';

@Injectable()
export class SocketEventsService {

  constructor(
    private socketStateService: SocketStateService,
    private socketUtilsService: SocketUtilsService,
  ) {

  }

  findDriverForTrip(rideRequest: RideRequest): Observable<TripDocumentPopulated> {
    const driverFinder = this.socketUtilsService.createDriverFinder();
    return driverFinder.find(rideRequest, {
      maxDistance: 500000,
      maxDrivers: 10,
      maxRequestsAtOnce: 5,
      tryNextDriverAfterNumOfFailedRequests: 1,
    });
  }

  sendDriverLocationToRider(riderId: string, lngLat: LngLat) {
     const riderSocketState = this.socketStateService.get(riderId)
    riderSocketState.handlers.forEach(handler => {
      handler.sendDriverLocationToRider(lngLat)
    })
  }


}
