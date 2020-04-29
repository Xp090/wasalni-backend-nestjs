import { BadRequestException, Controller, Get, Logger, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-strategy.passport';


@Controller('user')
export class UserController {

  @UseGuards(JwtAuthGuard)
  @Get('data')
  getUserData(@Request() req) {
    return req.user;
  }



}
