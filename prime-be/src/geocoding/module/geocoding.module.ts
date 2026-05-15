import { Module } from '@nestjs/common';
import { GeocodingController } from '../controller/geocoding.controller';
import { GeocodingService } from '../service/geocoding.service';

@Module({
  controllers: [GeocodingController],
  providers: [GeocodingService],
  exports: [GeocodingService],
})
export class GeocodingModule {}
