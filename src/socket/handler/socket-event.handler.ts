import { UserDocument } from '../../shared/models/user';
import { TripDocument, TripDocumentPopulated } from '../../shared/models/trip';
import { Subscription } from 'rxjs';
import { Socket } from 'socket.io';
import { SocketEventName } from '../declarations/socket-events.names';
import { LngLat } from '../../shared/models/location';
import { RideRequest, RideRequestDocument } from '../../shared/models/ride-request';
import { SocketEmitterFactory } from './socket.emiiter.factory';
import { SocketEventEmitterListener } from './socket.emitter';

export class SocketEventHandler<U = UserDocument>{


  socketEventFactory = new SocketEmitterFactory(this.socket);

  private _subscriptions = new Subscription();

  constructor(public socket: Socket) {

  }


  sendTripRequestToDriver() {
    return this.socketEventFactory
      .createSocketEventEmitterListener<RideRequestDocument, boolean>(SocketEventName.DriverListenForRiderRequest);
  }

  sendDriverLocationToRider(lngLat: LngLat) {
    return this.socketEventFactory
      .createSocketEventEmitter<LngLat>(SocketEventName.RiderListenForDriverLocation).emit(lngLat)
  }

  set subscriptions(subscription: Subscription) {
    this._subscriptions.add(subscription)
  }

  disposeSubscriptions() {
    this._subscriptions.unsubscribe();

  }

}




export class SocketStateContainer<U = UserDocument> {

  public handlers = new Map<string, SocketEventHandler<U>>()

  constructor(public user: U, public currentTrip: TripDocumentPopulated = null) {

  }


}


