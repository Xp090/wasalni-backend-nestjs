import {
  BadRequestException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

export class BaseHttpException extends HttpException {
  constructor (response: string | Record<string, any>, status: number) {
    super(response, status)
    // @ts-ignore
    Object.setPrototypeOf(this, this.__proto__);
  }
}

export class BaseBadRequestException extends BadRequestException {
  constructor (objectOrError?: string | object | any, description?: string) {
    super(objectOrError, description)
    // @ts-ignore
    Object.setPrototypeOf(this, this.__proto__);
  }
}

export class BaseNotFoundException extends NotFoundException {
  constructor (objectOrError?: string | object | any, description?: string) {
    super(objectOrError, description)
    // @ts-ignore
    Object.setPrototypeOf(this, this.__proto__);
  }
}

export class BaseRequestTimeoutException extends RequestTimeoutException {
  constructor (objectOrError?: string | object | any, description?: string) {
    super(objectOrError, description)
    // @ts-ignore
    Object.setPrototypeOf(this, this.__proto__);
  }
}

export class BaseInternalServerErrorException extends InternalServerErrorException {
  constructor (objectOrError?: string | object | any, description?: string) {
    super(objectOrError, description)
    // @ts-ignore
    Object.setPrototypeOf(this, this.__proto__);
  }
}

export class BaseWSException extends WsException {

}
