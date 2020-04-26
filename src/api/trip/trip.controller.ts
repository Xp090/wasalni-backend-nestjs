import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import googleMaps, {LatLng} from '@google/maps';
import { MapsService } from '../../shared/services/maps/maps.service';
import { TripEconomy } from '../../shared/models/trip';
import { TripService } from '../../shared/services/trip/trip.service';
import { JwtAuthGuard } from '../auth/jwt-strategy.passport';
import { HttpUser } from '../api.decroteors';
import { UserDocument } from '../../shared/models/user';
@Controller('trip')
export class TripController {

  constructor(private mapsService: MapsService,
              private tripService: TripService) {
  }

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
  @Get('current')
  getCurrentTrip(@HttpUser() user: UserDocument) {
    return this.tripService.getCurrentUserTrip(user.id)
  }
}
