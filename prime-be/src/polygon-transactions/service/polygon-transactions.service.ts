import { Inject, Injectable } from '@nestjs/common';
import { boundsReq, boundsRes, Coordinate, PolygonReq } from 'src/polygon/dto/polygon.dto';
import { DRIZZLE } from 'src/drizzle/drizzle.module';
import { DrizzleDB } from 'src/drizzle/schema/types/drizzle';
import { getPolygon } from 'src/util/polygon';

@Injectable()
export class PolygonTransactionsService {

  constructor(@Inject(DRIZZLE) private readonly db:DrizzleDB){}

  async getComplexGeo(req: PolygonReq): Promise<boundsRes[]> {
    const polygonStr = this.getComplexPolygon(req.points);
    
    let where = `where st_intersects(geo, st_geomfromtext('polygon((${polygonStr}))', 4326))`; 

    let sql = `select table_name as tableName from city ${where} group by table_name`;
    const [cityRows] = await this.db.execute(sql) as unknown as [{tableName: string}[], any];

    if (!cityRows || cityRows.length === 0) return [];

    sql = cityRows
    .map(row => ` select id, data, st_asgeojson(geo) as geo, false as is_registered from ${row.tableName} ${where}`)
    .join(` union all `);

    const tableNames = cityRows.map(row => `'${row.tableName}'`).join(",");

    sql += ` union all select id, data, st_asgeojson(geo) as geo, true as is_registered from region_article ${where} and table_name in(${tableNames})`;

    const [rows] = await this.db.execute(sql) as unknown as [{id: number, data: string, geo: string, is_registered:boolean}[],any];

    const mappedRows = rows.map(item => {
      const parsedData = item.data ? JSON.parse(item.data) : {};
      const parsedGeo = item.geo ? JSON.parse(item.geo) : null;
      const coordinates = parsedGeo?.coordinates?.[0] || null;
        return {
        id: item.id,
        ...parsedData,
        geo: coordinates,
        isRegistered: !!item.is_registered
      } as boundsRes;
    });

    return mappedRows;
}

  async getGeo(bounds: boundsReq): Promise<boundsRes[]> {
    
    const polygon = getPolygon(bounds); // 폴리곤 범위
    let where = `where mbrintersects(geo, st_geomfromtext('polygon((${polygon}))', 4326))`; 

    let sql = `select table_name as tableName from city ${where} group by table_name`; // 범위에 해당하는 지역들(테이블명) 추출
    const [cityRows] = await this.db.execute(sql) as unknown as [{tableName: string}[],any];

    if (!cityRows || cityRows.length === 0) return [];

    sql = cityRows
    .map(row => ` select id, data, st_asgeojson(geo) as geo, false as is_registered from ${row.tableName} ${where}`) // 지역들(테이블명) 데이터 호출
    .join(`union all`);

    const tableNames = cityRows
    .map(row => `'${row.tableName}'`)
    .join(",");

    sql += ` union all select id, data, st_asgeojson(geo) as geo, true as is_registered from region_article ${where} and table_name in(${tableNames})`;

    const [rows] = await this.db.execute(sql) as unknown as [{id: number, data: string, geo: string, is_registered:boolean}[],any];
    
    const mappedRows = rows.map(item => {
      const parsedData = item.data ? JSON.parse(item.data) : {};
      const parsedGeo = item.geo ? JSON.parse(item.geo) : null;
      const coordinates = parsedGeo?.coordinates?.[0] || null;
        return {
        id: item.id,
        ...parsedData,
        geo: coordinates,
        isRegistered: !!item.is_registered
      } as boundsRes;
    });

    return mappedRows;
  }
 

  getComplexPolygon(points: Coordinate[]): string {
    if (points.length < 3) throw new Error("폴리곤을 구성하려면 최소 3개의 점이 필요합니다.");
  
    // 첫 점과 끝 점이 다르면, 첫 점을 배열 끝에 추가해서 도형을 닫아줍니다 (Close the ring)
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    
    const polygonPoints = [...points];
    if (firstPoint.lat !== lastPoint.lat || firstPoint.lng !== lastPoint.lng) {
      polygonPoints.push(firstPoint);
    }
  
    // "경도 위도, 경도 위도" 형태의 문자열로 합치기
    return polygonPoints.map(p => `${p.lng} ${p.lat}`).join(', ');
  }
}
