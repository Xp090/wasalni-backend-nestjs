import { Injectable } from '@nestjs/common';
import { SocketStateService } from './socket-state.service';
import { DriverFinder } from '../utils/socket-driver-finder';
import { RideRequest, RideRequestDocument } from '../../shared/models/ride-request';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DriverDocument, UserDocument } from '../../shared/models/user';
import { TripDocument } from '../../shared/models/trip';
import { map } from 'rxjs/operators';
import { SocketUtilsService } from './socket-utils.service';

@Injectable()
export class SocketEventsService {

  constructor(
    private socketStateService: SocketStateService,
    private socketUtilsService: SocketUtilsService,
    @InjectModel('Driver') private driverModel: Model<DriverDocument>,
    @InjectModel('RideRequest') private rideRequestModel: Model<RideRequestDocument>,
    @InjectModel('Trip') private tripModel: Model<TripDocument>,
  ) {

  }

  findDriverForTrip(rideRequest: RideRequest) {
    const driverFinder = this.socketUtilsService.createDriverFinder();
    return driverFinder.find(rideRequest, {
      maxDistance: 500000,
      maxDrivers: 10,
      maxRequestsAtOnce: 5,
      tryNextDriverAfterNumOfFailedRequests: 1,
    });

  }


}
