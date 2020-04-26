import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Request } from 'express';

export const HttpUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest<Request>().user
  },
);
