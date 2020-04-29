import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import * as  jwtAuth from 'socketio-jwt-auth';
import { SESSION_SECRET } from '../../secrets';
import { UserService } from '../../shared/services/user/user.service';
import { UserDocument } from '../../shared/models/user';
import { SocketStateService } from './socket-state.service';

@Injectable()
export class SocketAuth {
  constructor(private userService: UserService,
              private socketStateService: SocketStateService) {
  }


  authenticate(server: Server) {
    server.use(jwtAuth.authenticate({
      secret: SESSION_SECRET,
      algorithm: 'HS256',
    }, async (token: any, done: any) => {
      try {
        const socketState = this.socketStateService.get(token.id)
        let user;
        if (socketState?.user) {
          user = socketState.user;
        } else {
          user = await this.userService.findUserById(token._id);
        }
        if (user) {
          return done(null, user);
        } else {
          done({ error: 'USER_NOT_FOUND' });
        }
      } catch (error) {
        done(error);
      }
    }));

    server.use((socket, next) => {
      const user: UserDocument = socket.request.user;
      socket.request.socketState = this.socketStateService.get(user.id);
      next();
    });
  }
}
