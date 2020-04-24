import { Module, Provider } from '@nestjs/common';
import { UserService } from './services/user/user.service';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { DriverSchema, RiderSchema, UserSchema } from './models/user';
import { MapsService } from './services/maps/maps.service';
import { RideRequestSchema } from './models/ride-request';
import { TripSchema } from './models/trip';

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
        name: 'User',
        schema: UserSchema
      },
      {
        name: 'RideRequest',
        schema: RideRequestSchema
      },
      {
        name: 'Trip',
        schema: TripSchema
      },
    ])
  ],
  providers:[
    UserService,
    MapsService,
    ...userDiscriminatorProviders
  ],
  exports: [
    UserService,
    MongooseModule,
    MapsService,
    ...userDiscriminatorProviders
  ]
})
export class SharedModule {}


