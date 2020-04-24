import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit, SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtAuthGuard, JwtStrategy } from '../api/auth/jwt-strategy.passport';
import { SocketAuth } from './services/socket.auth';
import { Logger, UseGuards } from '@nestjs/common';
import { SocketRider, SocketUser } from './utils/socket.decorators';
import { RiderDocument, UserDocument } from '../shared/models/user';
import { GeoPointDB, LngLat } from '../shared/models/location';
import { SocketEventName } from './declarations/socket-events.names';
import { RideRequest } from '../shared/models/ride-request';
import { SocketStateService } from './services/socket-state.service';
import { SocketEventsService } from './services/socket-events.service';
import { SocketUtilsService } from './services/socket-utils.service';
import { tap } from 'rxjs/operators';
import { GeoPointPipe } from '../shared/pipes/geo-point.pipe';

@WebSocketGateway()
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect{


  @WebSocketServer() server: Server;

  constructor(
    private socketAuth: SocketAuth,
    private socketStateService: SocketStateService,
    private socketEventsService: SocketEventsService,
    private socketUtilsService: SocketUtilsService
  ) {

  }

  @SubscribeMessage(SocketEventName.UpdateLocation)
  updateUserLocation(@ConnectedSocket() client: Socket,
                     @MessageBody(GeoPointPipe) data : GeoPointDB,
                     @SocketUser() user: UserDocument) {
    user.location = data; //todo set location directly
    user.save();
    if (handler.currentTrip && handler.user.type == "Driver") {
      const riderHandler = UsersSocketHandlers.get(handler.currentTrip.rideRequest.rider.id);
      riderHandler?.sendDriverLocationToRider(location);
    }
  }

  @SubscribeMessage(SocketEventName.RiderFindDriverRequest)
  riderFindDriverRequest(@ConnectedSocket() client: Socket,
                     @MessageBody() data:RideRequest,
                     @SocketRider() rider: RiderDocument) {
    data.rider = rider;
    return this.socketEventsService.findDriverForTrip(data)
      .pipe(tap(trip => {
        this.socketUtilsService.updateTripForSocketState(trip.rideRequest.driver.id,trip)
        this.socketUtilsService.updateTripForSocketState(trip.rideRequest.rider.id,trip)
      }))
  }


  afterInit(server: Server) {
   this.socketAuth.authenticate(server);
  }

  handleConnection(client: Socket,  ...args: any[]) {
    const user = client.request.user;
    Logger.log(`${user.type} ${user.email} Connected`)
    this.socketStateService.add(client);
  }

  handleDisconnect(client: Socket) {
    const user = client.request.user;
    Logger.log(`${user.type} ${user.email} Disconnected`)
    console.log(user.type ,client.id, "Disconnected")
    this.socketStateService.remove(client);
  }

}

