import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { SocketEventHandler, SocketStateContainer } from '../handler/socket-event.handler';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from "mongoose";
import { TripDocument } from '../../shared/models/trip';
import { UserDocument } from '../../shared/models/user';

@Injectable()
export class SocketStateService {

  constructor(
    @InjectModel('Trip') private tripModel: Model<TripDocument>
  ) {
  }
  private socketState = new Map<string, SocketStateContainer>()

  public remove(socket: Socket): boolean {
    const user = socket.request.user;
    const existingState = this.socketState.get(user.id)

    if (!existingState) {
      return true
    }

    existingState.handlers.delete(socket.id);

    if (!existingState.handlers) {
      this.socketState.delete(user.id)
    } else {
      this.socketState.set(user.id, existingState)
    }

    return true
  }

  public add(socket: Socket): boolean {
    const user = socket.request.user;

    let existingState = this.socketState.get(user.id)

    if (!existingState) {
      existingState = new SocketStateContainer(user)
    }
    existingState.handlers.set(socket.id, new SocketEventHandler(socket))

    this.socketState.set(user.id, existingState)

    return true
  }

  public get<U = UserDocument>(userId: string): SocketStateContainer<U> {
    return this.socketState.get(userId) as unknown as SocketStateContainer<U>
  }

  // public getAll(): SocketEventHandler[] {
  //   const all = []
  //
  //   this.socketState.forEach(sockets => all.push(sockets))
  //
  //   return all
  // }
}
