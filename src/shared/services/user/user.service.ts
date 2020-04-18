import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DriverDocument } from '../../models/user';
import { Model } from 'mongoose';

@Injectable()
export class UserService {

  constructor(@InjectModel('User') private driverModel: Model<DriverDocument>) {

  }

}
