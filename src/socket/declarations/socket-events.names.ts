export enum SocketEventName {
  Heartbeat = "Heartbeat",
  InstantHeartbeat = "InstantHeartbeat",
  UpdateLocation = "UpdateLocation",
  RiderFindDriverRequest = "RiderFindDriverRequest",
  CancelFindDriverRequest = "CancelFindDriverRequest",
  DriverListenForRiderRequest = "DriverListenForRiderRequest",
  RiderListenForDriverLocation = "RiderListenForDriverLocation"
}
