
import { applyDecorators, Bind, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Socket } from 'socket.io';
import { DriverDocument, RiderDocument } from '../../shared/models/user';
import { ConnectedSocket, MessageBody } from '@nestjs/websockets';

export const SocketUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    return ctx.switchToWs().getClient<Socket>().request.user
  },
);

// export const SocketDriver = createParamDecorator(
//   (data: string, ctx: ExecutionContext) => {
//     return (ctx.switchToWs().getClient<Socket>().request.user) as DriverDocument
//   },
// );
//
// export const SocketRider = createParamDecorator(
//   (data: string, ctx: ExecutionContext) => {
//     return (ctx.switchToWs().getClient<Socket>().request.user) as RiderDocument
//   },
// );


export const SocketState = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    return (ctx.switchToWs().getClient<Socket>().request.socketState)
  },
);
