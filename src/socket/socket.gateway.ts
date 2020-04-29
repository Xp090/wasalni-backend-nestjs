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
import { SocketState, SocketUser } from './utils/socket.decorators';
import { RiderDocument, UserDocument } from '../shared/models/user';
import { GeoPointDB, LngLat } from '../shared/models/location';
import { SocketEventName } from './declarations/socket-events.names';
import { RideRequest } from '../shared/models/ride-request';
import { SocketStateService } from './services/socket-state.service';
import { SocketEventsService } from './services/socket-events.service';
import { SocketUtilsService } from './services/socket-utils.service';
import { tap } from 'rxjs/operators';
import { GeoPointPipe } from '../shared/pipes/geo-point.pipe';
import { SocketStateContainer } from './handler/socket-event.handler';

@WebSocketGateway()
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {


  @WebSocketServer() server: Server;

  constructor(
    private socketAuth: SocketAuth,
    private socketStateService: SocketStateService,
    private socketEventsService: SocketEventsService,
    private socketUtilsService: SocketUtilsService,
  ) {

  }

  @SubscribeMessage(SocketEventName.UpdateLocation)
  updateUserLocation(@MessageBody() data: LngLat,
                     @SocketUser() user: UserDocument,
                     @SocketState() socketState: SocketStateContainer) {

    user.location = GeoPointDB.create(data);
    user.save();
    if (user.isUserDriver() && socketState?.currentTrip) {
      this.socketEventsService.sendDriverLocationToRider(socketState.currentTrip.rideRequest.rider.id, data);
    }
  }

  @SubscribeMessage(SocketEventName.RiderFindDriverRequest)
  riderFindDriverRequest(@MessageBody() data: RideRequest,
                         @SocketUser() rider: RiderDocument) {
    data.rider = rider;
    return this.socketEventsService.findDriverForTrip(data)
      .pipe(tap(trip => {
        this.socketUtilsService.updateTripForSocketState(trip.rideRequest.driver.id, trip);
        this.socketUtilsService.updateTripForSocketState(trip.rideRequest.rider.id, trip);
      }));
  }

  @SubscribeMessage(SocketEventName.CancelFindDriverRequest)
  cancelRiderFindDriverRequest(@SocketState() socketState: SocketStateContainer) {
    socketState.currentDriverFinder?.cancel();
    socketState.currentDriverFinder = null;
  }

  @SubscribeMessage(SocketEventName.TripHandshake)
  tripHandshake(@SocketState() socketState: SocketStateContainer) {

  }


  ///////////////////////////////////////////////////////////////////////////
  afterInit(server: Server) {
    this.socketAuth.authenticate(server);
  }

  handleConnection(client: Socket, ...args: any[]) {
    const user = client.request.user;
    Logger.log(`${user.type} ${user.email} Connected`);
    this.socketStateService.add(client);
  }

  handleDisconnect(client: Socket) {
    const user = client.request.user;
    Logger.log(`${user.type} ${user.email} Disconnected`);
    this.socketStateService.remove(client);
  }

}

