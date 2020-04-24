import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {  UserDocument } from '../../models/user';
import { Model } from 'mongoose';

@Injectable()
export class UserService {

  constructor(@InjectModel('User') private userModel: Model<UserDocument>) {

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

}
