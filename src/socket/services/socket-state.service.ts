import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { SocketEventHandler, SocketStateContainer } from '../handler/socket-event.handler';
import { UserDocument } from '../../shared/models/user';
import { TripService } from '../../shared/services/trip/trip.service';

@Injectable()
export class SocketStateService {

  constructor(private tripService: TripService) {

  }

  private socketState = new Map<string, SocketStateContainer>();

  public remove(socket: Socket): boolean {
    const user = socket.request.user;
    const existingState = this.socketState.get(user.id);

    if (!existingState) {
      return true;
    }

    existingState.handlers.delete(socket.id);

    if (!existingState.handlers) {
      this.socketState.delete(user.id);
    } else {
      this.socketState.set(user.id, existingState);
    }

    return true;
  }

  public async add(socket: Socket): Promise<boolean> {
    const user = socket.request.user;

    let existingState = this.socketState.get(user.id);

    if (!existingState) {
      existingState = new SocketStateContainer(user);
    }
    existingState.handlers.set(socket.id, new SocketEventHandler(socket));

    try {
      existingState.currentTrip = await this.tripService.getCurrentUserTrip(user.id);
    }catch (e) {
      Logger.error(e)
    }finally {
      this.socketState.set(user.id, existingState);
    }

    return true;
  }

  public get<U = UserDocument>(userId: string): SocketStateContainer<U> {
    return this.socketState.get(userId) as unknown as SocketStateContainer<U>;
  }

  // public getAll(): SocketEventHandler[] {
  //   const all = []
  //
  //   this.socketState.forEach(sockets => all.push(sockets))
  //
  //   return all
  // }
}
