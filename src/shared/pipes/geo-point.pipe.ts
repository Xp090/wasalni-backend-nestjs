import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { GeoPointDB, LngLat } from '../models/location';

@Injectable()
export class GeoPointPipe implements PipeTransform<LngLat,GeoPointDB> {
  transform(value: LngLat, metadata: ArgumentMetadata): GeoPointDB {
    return GeoPointDB.create(value);
  }

}
