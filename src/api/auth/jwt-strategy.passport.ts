import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { SESSION_SECRET } from '../../secrets';
import { UserService } from '../../shared/services/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: SESSION_SECRET,
    });
  }

  async validate(payload: any) {
    try {
      const user = await this.userService.findUserById(payload._id);
      if (user) {
        return user;
      }
      return null;
    } catch (e) {
      throw e;
    }
  }
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {

  // canActivate(context: ExecutionContext) {
  //   return super.canActivate(context);
  // }
  //
  // handleRequest(err, user, info) {
  //   if (err || !user) {
  //     throw err || new UnauthorizedException("USER_NOT_FOUND");
  //   }
  //   return user;
  // }
}
