import { Controller, Post, UseGuards, Request, Get } from '@nestjs/common';
import { LocalAuthGuard } from './local-strategy.passport';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-strategy.passport';

@Controller('auth')
export class AuthController {

  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user) ;
  }

}
