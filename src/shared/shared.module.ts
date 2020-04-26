import { Module, Provider } from '@nestjs/common';
import { UserService } from './services/user/user.service';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { DriverSchema, RiderSchema, UserSchema } from './models/user';
import { MapsService } from './services/maps/maps.service';
import { RideRequestSchema } from './models/ride-request';
import { TripSchema } from './models/trip';
import { TripService } from './services/trip/trip.service';
import { DBModel } from './db/collections';
import { RideRequestService } from './services/ride-request/ride-request.service';

export const userDiscriminatorProviders: Provider[] = [
  {
    provide: getModelToken('Rider'),
    useFactory: (userModel) => userModel.discriminator("Rider", RiderSchema),
    inject: [ getModelToken('User') ]
  },
  {
    provide: getModelToken('Driver'),
    useFactory: (userModel) => userModel.discriminator("Driver", DriverSchema),
    inject: [ getModelToken('User') ]
  },

];

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: DBModel.User,
        schema: UserSchema
      },
      {
        name: DBModel.RideRequest,
        schema: RideRequestSchema
      },
      {
        name: DBModel.Trip,
        schema: TripSchema
      },
    ])
  ],
  providers:[
    UserService,
    MapsService,
    RideRequestService,
    TripService,
    ...userDiscriminatorProviders
  ],
  exports: [
    UserService,
    MongooseModule,
    MapsService,
    RideRequestService,
    TripService,
    ...userDiscriminatorProviders
  ]
})
export class SharedModule {}


