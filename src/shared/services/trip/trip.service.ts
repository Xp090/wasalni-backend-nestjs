import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserDocument } from '../../models/user';
import { TripDocument, TripDocumentPopulated, TripStatus } from '../../models/trip';
import { InjectDBModel } from '../../db/decorations';
import { DBModel } from '../../db/collections';
import { RideRequestDocument } from '../../models/ride-request';


@Injectable()
export class TripService {

  constructor(@InjectDBModel(DBModel.User) private userModel: Model<UserDocument>,
              @InjectDBModel(DBModel.Trip) private tripModel: Model<TripDocument>) {
  }

  async getCurrentUserTrip(userId: string): Promise<TripDocumentPopulated> {
    return await this.tripModel.findOne({
      $and: [
        {
          $or: [
            {
              'rideRequest.driver': new Types.ObjectId(userId),
            },
            {
              'rideRequest.rider': new Types.ObjectId(userId),
            },
          ],
        },
        {
          $or: [
            {
              tripStatus: TripStatus.DriverOnTheWayForPickUpPoint,
            },
            {
              tripStatus: TripStatus.DriverArrivedAtPickUpPoint,
            },
            {
              tripStatus: TripStatus.TripOngoing,
            },
          ],
        },
      ],
    })
      .sort('-created_at')
      .populate('rideRequest.rider').populate('rideRequest.driver')
      .exec() as TripDocumentPopulated;
  }

  async createTrip(rideRequest: RideRequestDocument): Promise<TripDocumentPopulated> {
    const trip = await this.tripModel.create({ rideRequest: rideRequest });
    return await trip
      .populate('rideRequest.rider')
      .populate('rideRequest.driver')
      .execPopulate() as TripDocumentPopulated;
  }
}
