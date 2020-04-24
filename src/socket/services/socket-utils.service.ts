import { Injectable } from '@nestjs/common';
import { DriverFinder } from '../utils/socket-driver-finder';
import { SocketStateService } from './socket-state.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from "mongoose";
import { DriverDocument } from '../../shared/models/user';
import { RideRequestDocument } from '../../shared/models/ride-request';
import { TripDocument, TripDocumentPopulated } from '../../shared/models/trip';

@Injectable()
export class SocketUtilsService {

  constructor(
    private socketStateService: SocketStateService,
    @InjectModel('Driver') private driverModel: Model<DriverDocument>,
    @InjectModel('RideRequest') private rideRequestModel: Model<RideRequestDocument>,
    @InjectModel('Trip') private tripModel: Model<TripDocument>,
  ) {

  }

  public createDriverFinder() {
    return new DriverFinder(this.socketStateService,this.driverModel,this.rideRequestModel,this.tripModel)
  }

  public updateTripForSocketState(userId: string, trip: TripDocumentPopulated) {
    const state = this.socketStateService.get(userId)
    state.currentTrip = trip;
  }
}
