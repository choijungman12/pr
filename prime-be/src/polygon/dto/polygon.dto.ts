import { Type } from 'class-transformer';
import { IsArray, IsNumber, ValidateNested } from 'class-validator';

export class boundsReq {
  @IsNumber()
  neLat: number;

  @IsNumber()
  neLng: number;

  @IsNumber()
  swLat: number;

  @IsNumber()
  swLng: number;
}

export class boundsRes {
  pnu: string;
  coordinates: number[][];
  point: number[];
  areaName: string;
  landBookName: string;
  jibunNum: string;
  landType: string;
  landArea: string;
  useLandName1: string;
  useLandName2: string;
  useLandState: string;
  landHeight: string;
  landShape: string;
  loadShape: string;
  landPrice: string;
  asisPrices: {
    price1: number;
    price2: number;
    price3: number;
    price4: number;
  };
  realEstatePrices: {
    dealingGbn: string;
    deals: Array<{
      dealAmount: string;
      dealYear: number;
      dealMonth: number;
      dealDay: number;
      estateAgentSggNm: string;
      shareDealingType: string;
      cDealType: string;
      cDealDay: string;
    }>;
  };
  createdAt: string;
  shareState: string;
  sharePeople: string;
  ageRange: string;
  liveState: string;
  nationState: string;
  diffShareState: string;
  diffShareDay: string;
  isRegistered: boolean;
}

export class pointReq {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}

export class pointRes {
  pnu: string;
  coordinates: number[][];
  areaName: string;
  landBookName: string;
  jibunNum: string;
  landType: string;
  landArea: string;
  useLandName1: string;
  useLandName2: string;
  useLandState: string;
  landHeight: string;
  landShape: string;
  loadShape: string;
  landPrice: string;
  asisPrices: {
    price1: number;
    price2: number;
    price3: number;
    price4: number;
  };
  realEstatePrices: {
    dealingGbn: string;
    deals: Array<{
      dealAmount: string;
      dealYear: number;
      dealMonth: number;
      dealDay: number;
      estateAgentSggNm: string;
      shareDealingType: string;
      cDealType: string;
      cDealDay: string;
    }>;
  };
  createdAt: string;
  shareState: string;
  sharePeople: string;
  ageRange: string;
  liveState: string;
  nationState: string;
  diffShareState: string;
  diffShareDay: string;
}

export class Coordinate {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}

export class PolygonReq {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Coordinate)
  points: Coordinate[]; // 수많은 좌표들을 배열로 받습니다.
}