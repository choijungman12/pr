import { IsNumber, IsNotEmpty } from 'class-validator';

export class ReverseGeocodingRequestDto {
    @IsNumber()
    @IsNotEmpty()
    latitude: number;

    @IsNumber()
    @IsNotEmpty()
    longitude: number;
}

export class ReverseGeocodingResponseDto {
    pnu: string;
    address: string;
    roadAddress: string;
}
