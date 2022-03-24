import { Injectable } from '@nestjs/common';
import * as googleMaps from '@google/maps';
import {LatLng} from '@google/maps';
import { GoogleDirectionsResult } from './maps.models';

@Injectable()
export class MapsService {
  private googleMapsClient = googleMaps.createClient({
    key : "",
    Promise: Promise,
  });

   getDirections(origin:LatLng, destination:LatLng) : Promise<GoogleDirectionsResult> {
    return this.googleMapsClient.directions({destination: destination,origin: origin})
      .asPromise()
      .then(res => {
        console.log(res);
        const leg = res.json.routes[0].legs[0];
        const googleDirectionsResult: GoogleDirectionsResult = {
          distance: leg.distance,
          duration: leg.duration,
          startAddress: leg.start_address,
          endAddress: leg.end_address,
          polylines: leg.steps.map(step => step.polyline.points)
        };
        return googleDirectionsResult;
      })

  }

}
