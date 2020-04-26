import { Injectable } from '@nestjs/common';
import { RideRequest, RideRequestDocument } from '../../models/ride-request';
import { InjectDBModel } from '../../db/decorations';
import { DBModel } from '../../db/collections';
import { Model } from "mongoose";


@Injectable()
export class RideRequestService {

  constructor(@InjectDBModel(DBModel.RideRequest) private rideRequestModel: Model<RideRequestDocument>) {
  }


  createRideRequest(incomingRequest: RideRequest) {
    return this.rideRequestModel.create(incomingRequest);
  }

}
