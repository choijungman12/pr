import { IsNumber } from 'class-validator';
export class eupmeoundongResponse {
    empcd: string;
    coladmse: string;
    emdnm: string;
    coordinates: number[][][];
    dealCount: number;
    avgDealAmount_all: number;
    avgDealAmount_m: number;
    avgDealAmount_p: number;
    point: number[];
}

export class eupmeoundongReq {
    @IsNumber()
    neLat: number;
    @IsNumber()
    neLng: number;
    @IsNumber()
    swLat: number;
    @IsNumber()
    swLng: number;
}
