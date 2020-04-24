import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { SESSION_SECRET } from '../secrets';
import { AuthService } from './auth/auth.service';
import { JwtStrategy } from './auth/jwt-strategy.passport';
import { LocalStrategy } from './auth/local-strategy.passport';
import { AuthController } from './auth/auth.controller';
import { UserController } from './user/user.controller';
import { TripController } from './trip/trip.controller';


@Module({
  imports: [
    SharedModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: SESSION_SECRET,
      signOptions: { expiresIn: '360d' },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController, UserController, TripController],
  exports: [JwtStrategy]
})
export class ApiModule {}
