import { Module, Provider } from '@nestjs/common';
import { UserService } from './services/user/user.service';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { DriverSchema, RiderSchema, UserSchema } from './models/user';

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
      }
    ])
  ],
  providers:[UserService, ...userDiscriminatorProviders],
  exports: [UserService, MongooseModule, ...userDiscriminatorProviders]
})
export class SharedModule {}


