import {
  BadRequestException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

export class BaseSocketException extends WsException {
  constructor(error: string | object) {
    super(error)
    // @ts-ignore
    Object.setPrototypeOf(this, this.__proto__);
  }
}
