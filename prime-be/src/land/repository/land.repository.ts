import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE } from 'src/drizzle/drizzle.module';
import { DrizzleDB } from 'src/drizzle/schema/types/drizzle';

@Injectable()
export class LandRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  /**
   * 등록 가능한 지역 테이블 이름 목록.
   * Drizzle 스키마에 정의된 17개 시·도 테이블을 화이트리스트로 유지한다.
   * (information_schema 조회 대신 ORM 정의와 일관성을 보장)
   */
  listAvailableRegions(): string[] {
    return [
      'seoul',
      'busan',
      'daegu',
      'incheon',
      'gwangju',
      'daejeon',
      'ulsan',
      'sejong',
      'gyeonggi',
      'gangwon',
      'chungcheongbuk',
      'chungcheongnam',
      'jeollabuk',
      'jeollanam',
      'gyeongsangbuk',
      'gyeongsangnam',
      'jeju',
    ];
  }

  /**
   * region_article 테이블에 등록 매물 1건 삽입.
   * polygon-transactions.service.ts가 `is_registered=true`로 조회하는 테이블이다.
   */
  async insertRegionArticle(params: {
    tableName: string;
    geoWkt: string;
    pointText: string;
    data: string;
    landType: string;
    landArea: number;
    landName: string;
    amount: number;
    year: number;
    month: number;
    day: number;
  }): Promise<number> {
    const sqlText = `
      INSERT INTO region_article
        (table_name, land_type, land_area, land_name, amount, year, month, day, geo, point, data)
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ST_GeomFromText(?, 4326), ?, ?)
    `;

    const [result] = (await (this.db as any).execute(sqlText, [
      params.tableName,
      params.landType,
      params.landArea,
      params.landName,
      params.amount,
      params.year,
      params.month,
      params.day,
      params.geoWkt,
      params.pointText,
      params.data,
    ])) as any;

    return Number(result?.insertId ?? 0);
  }
}
