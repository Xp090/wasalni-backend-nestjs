import { Injectable } from '@nestjs/common';
import { UserService } from '../../shared/services/user/user.service';
import { UserDocument } from '../../shared/models/user';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  constructor(
    private userService: UserService,
    private jwtService: JwtService
  ) {}


  async validateUser(email: string, password: string): Promise<UserDocument> {
    const user = await this.userService.findUserByEmail(email);
    if (user) {
     const isSamePassword = await user.comparePassword(password);
      if (isSamePassword) {
        return user;
      }
    }
    return null;
  }

  async login(user: UserDocument) {
    const payload = { username: user.email, _id: user._id };
    return {
      token: this.jwtService.sign(payload),
      user: user
    };
  }
}
