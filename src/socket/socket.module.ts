import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { ApiModule } from '../api/api.module';
import { SocketAuth } from './services/socket.auth';
import { SharedModule } from '../shared/shared.module';
import { SocketStateService } from './services/socket-state.service';
import { SocketEventsService } from './services/socket-events.service';
import { SocketUtilsService } from './services/socket-utils.service';

@Module({
  imports: [ApiModule, SharedModule],
  providers: [
    SocketGateway,
    SocketAuth,
    SocketStateService,
    SocketEventsService,
    SocketUtilsService
  ],
  exports: [SocketGateway],
})
export class SocketModule {
}
