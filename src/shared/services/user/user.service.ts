import { Injectable } from '@nestjs/common';
import { DriverDocument, UserDocument } from '../../models/user';
import { FilterQuery, Model } from 'mongoose';
import { InjectDBModel } from '../../db/decorations';
import { DBModel } from '../../db/collections';

@Injectable()
export class UserService {

  constructor(@InjectDBModel(DBModel.User) private userModel: Model<UserDocument>,
              @InjectDBModel(DBModel.Driver) private driverModel: Model<DriverDocument>) {

  }

  async findUserById(id: string): Promise<UserDocument>  {
    try {
      const user = await this.userModel.findById(id).exec();
      if (user) {
        return user;
      }else{
        throw new Error("USER_NOT_FOUND")
      }
    } catch (error) {
      throw error
    }
  }

  async findUserByEmail(email: string) {
    try {
      const user = await this.userModel.findOne({ email: email.toLowerCase() }).exec();
      if (user) {
        return user;
      } else {
        throw new Error("USER_NOT_FOUND")
      }
    }catch (e) {
      throw e
    }
  }

  getDrivers(conditions: FilterQuery<DriverDocument>,limit: number) {
    return this.driverModel.find(conditions).limit(limit).exec()
  }

}
