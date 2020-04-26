import { Injectable } from '@nestjs/common';
import { DriverFinder } from '../utils/socket-driver-finder';
import { SocketStateService } from './socket-state.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from "mongoose";
import { DriverDocument } from '../../shared/models/user';
import { RideRequestDocument } from '../../shared/models/ride-request';
import { TripDocument, TripDocumentPopulated } from '../../shared/models/trip';
import { UserService } from '../../shared/services/user/user.service';
import { RideRequestService } from '../../shared/services/ride-request/ride-request.service';
import { TripService } from '../../shared/services/trip/trip.service';

@Injectable()
export class SocketUtilsService {

  constructor(
    private socketStateService: SocketStateService,
    private userService: UserService,
    private rideRequestService: RideRequestService,
    private tripService: TripService,
  ) {

  }

  public createDriverFinder() {
    return new DriverFinder(this.socketStateService,this.userService,this.rideRequestService,this.tripService)
  }

  public updateTripForSocketState(userId: string, trip: TripDocumentPopulated) {
    const state = this.socketStateService.get(userId)
    state.currentTrip = trip;
  }
}
