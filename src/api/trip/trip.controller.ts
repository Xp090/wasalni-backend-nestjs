import { Controller, Get, Query, Request } from '@nestjs/common';
import googleMaps, {LatLng} from '@google/maps';
import { MapsService } from '../../shared/services/maps/maps.service';
import { TripEconomy } from '../../shared/models/trip';
@Controller('trip')
export class TripController {

  constructor(private mapsService: MapsService) {
  }

  @Get('cost')
  getTripCost(@Query("origin") origin:string,
              @Query("destination") destination:string) {
   return this.mapsService.getDirections(origin,destination)
      .then(result => {
        const cost: TripEconomy = {cost: Math.round(result.distance.value * 0.025)};
        return {
          tripDirections: result,
          tripEconomy: cost
        };
      })
      .catch(reason => {
        console.log(reason);
        throw new Error(reason.toString())
      })
  }
}
