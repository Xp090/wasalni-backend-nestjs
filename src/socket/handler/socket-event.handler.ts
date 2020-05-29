import { DriverDocument, UserDocument } from '../../shared/models/user';
import { TripDocument, TripDocumentPopulated } from '../../shared/models/trip';
import { EMPTY, merge, Observable, Subscription, throwError, TimeoutError } from 'rxjs';
import { Socket } from 'socket.io';
import { SocketEventName } from '../declarations/socket-events.names';
import { LngLat } from '../../shared/models/location';
import { RideRequest, RideRequestDocument } from '../../shared/models/ride-request';
import { SocketEmitterFactory } from './socket.emiiter.factory';
import { SocketEventEmitterListener } from './socket.emitter';
import { DriverFinder } from '../utils/socket-driver-finder';
import { catchError, defaultIfEmpty, mergeAll, throwIfEmpty } from 'rxjs/operators';

export class SocketEventHandler<U = UserDocument> {


  socketEventFactory = new SocketEmitterFactory(this.socket);

  private _subscriptions = new Subscription();

  constructor(public socket: Socket) {

  }


  sendTripRequestToDriver(rideRequest: RideRequestDocument) {
    return this.socketEventFactory
      .createSocketEventEmitterListener<RideRequestDocument,
        boolean>(SocketEventName.DriverListenForRiderRequest).emitThenListenOnce(rideRequest);
  }

  sendDriverLocationToRider(lngLat: LngLat) {
    return this.socketEventFactory
      .createSocketEventEmitter<LngLat>(SocketEventName.RiderListenForDriverLocation).emit(lngLat);
  }

  handshakeTripWithRider(driver: DriverDocument) {
    return this.socketEventFactory
      .createSocketEventEmitterListener<DriverDocument,
        boolean>(SocketEventName.DriverListenForRiderRequest).emitThenListenOnce(driver);
  }

  set subscriptions(subscription: Subscription) {
    this._subscriptions.add(subscription);
  }

  disposeSubscriptions() {
    this._subscriptions.unsubscribe();

  }

}


export class SocketStateContainer<U = UserDocument> {

  public handlers = new Map<string, SocketEventHandler<U>>();
  public currentTrip: TripDocumentPopulated = null;
  public currentDriverFinder: DriverFinder = null;

  constructor(public user: U) {

  }

  callHandlers(fn: (handler: SocketEventHandler) => void) {
    this.handlers.forEach(fn);
  }

  callHandlersForResult<T>(fn: (handler: SocketEventHandler) => Observable<T>): Observable<T>{
    const obs = Array.from(this.handlers.values())
      .map(handler => fn(handler)
        .pipe(catchError(err =>{
          if (err.name === 'TimeoutError'){
            return EMPTY
          }else {
            throw err
          }
        })));
    return merge(...obs).pipe(
     throwIfEmpty(() => new TimeoutError ())
    );
  }
}


