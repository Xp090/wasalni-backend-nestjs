import { BaseSocketException } from './base-socket.exception';

export class TripInvalidHandshakeException extends BaseSocketException{

  constructor() {
    super("invalid_handshake");
  }
}

export class TripHandshakeFailedException extends BaseSocketException{

  constructor() {
    super("handshake_failed");
  }
}
