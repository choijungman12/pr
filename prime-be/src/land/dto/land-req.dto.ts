import { IsArray, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

/**
 * POST /land/register 요청 페이로드
 * 관리자 콘솔(prime-fe-admin) PropertyForm.js에서 buildLandRegisterPayload로 생성된다.
 */
export class LandRegisterReq {
  @IsString()
  @IsNotEmpty()
  region!: string; // e.g. "seoul", "gyeonggi"

  @IsArray()
  geo!: Array<Array<number>>; // [[lng, lat], ...] polygon outer ring

  @IsArray()
  point!: number[]; // [lng, lat]

  @IsString()
  @IsOptional()
  sale_price?: string;

  @IsObject()
  data!: Record<string, unknown>;
}
