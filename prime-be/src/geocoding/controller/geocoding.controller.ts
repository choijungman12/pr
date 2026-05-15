import { Controller, Get, Query } from '@nestjs/common';
import { GeocodingRequestDto, GeocodingResponseDto } from '../dto/geocoding.dto';
import { ReverseGeocodingRequestDto, ReverseGeocodingResponseDto } from '../dto/reverse.geocoding.dto';
import { GeocodingService } from '../service/geocoding.service';
import { BaseResponse } from 'src/util/base-response';

@Controller('geocoding')
export class GeocodingController {
  constructor(private readonly geocodingService: GeocodingService) {}

  @Get()
  async getCoordinates(@Query() dto: GeocodingRequestDto): Promise<BaseResponse<GeocodingResponseDto | {}>> {
    return BaseResponse.of(await this.geocodingService.getCoordinates(dto));
  }

  @Get('reverse')
  async getAddress(@Query() dto: ReverseGeocodingRequestDto): Promise<BaseResponse<ReverseGeocodingResponseDto>> {
    return BaseResponse.of(await this.geocodingService.getAddress(dto));
  }
}
