export enum SocketEventName {
  Connection = 'connection',
  Disconnect = 'disconnect',
  UpdateLocation = "UpdateLocation",
  RiderFindDriverRequest = "RiderFindDriverRequest",
  CancelFindDriverRequest = "CancelFindDriverRequest",
  TripHandshake = "TripHandshake",
  DriverListenForRiderRequest = "DriverListenForRiderRequest",
  RiderListenForDriverLocation = "RiderListenForDriverLocation"
}
