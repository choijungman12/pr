import { IsNumber } from 'class-validator';
export class sigunguResponse {
  admSectCode: string;
  sggNm: string;
  coordinates: number[][][];
  dealCount: number;
  avgDealAmount_all: number;
  avgDealAmount_m: number;
  avgDealAmount_p: number;
  point: number[];
}

export class sigunguReq {
  @IsNumber()
  neLat: number;
  @IsNumber()
  neLng: number;
  @IsNumber()
  swLat: number;
  @IsNumber()
  swLng: number;
}
