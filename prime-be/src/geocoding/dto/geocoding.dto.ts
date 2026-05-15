import { IsString, IsNotEmpty } from 'class-validator';

export class GeocodingRequestDto {
  @IsString()
  @IsNotEmpty()
  address: string;
}

export class GeocodingResponseDto {
  latitude: number;
  longitude: number;
  address: string;
}
