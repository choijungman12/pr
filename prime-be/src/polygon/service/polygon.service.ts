import { Injectable, Logger, Inject } from '@nestjs/common';
import { boundsReq, pointReq, pointRes } from 'src/polygon/dto/polygon.dto';
import { sigunguResponse, sigunguReq } from 'src/polygon/dto/sigungu.dto';
import { eupmeoundongReq,eupmeoundongResponse } from 'src/polygon/dto/eupmeoundong.dto';
import { publichouseRes } from 'src/polygon/dto/publichouse.dto';
import * as path from 'path';
import * as fs from 'node:fs';
import JSONStream from 'JSONStream';
import RBush from 'rbush';
import { performance } from 'perf_hooks';
import * as https from 'https';
import * as Exception from 'src/common/exception/service/service.exception';
import { BoundingBox, SpatialIndexEntry } from 'src/polygon/interface/polygon.interface';
import { ConfigService } from '@nestjs/config';
import { DRIZZLE } from 'src/drizzle/drizzle.module';
import { DrizzleDB } from 'src/drizzle/schema/types/drizzle';
import { sql } from 'drizzle-orm';
import * as schema from 'src/drizzle/schema/schema';
import { getPolygon } from 'src/util/polygon';
import { plainToInstance } from 'class-transformer';

type DataType = 'eupmeoundong' | 'sigungu';

type IndexFile = {
  version: number;
  generatedAt: string;
  dataType: DataType;
  basePath: string;
  entries: Array<{
    filePath: string;
    pnu: string; // 5자리 prefix pnu코드
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  }>;
};

@Injectable()
export class PolygonService {
  private readonly logger = new Logger(PolygonService.name);
  private readonly VWORLD_API_KEY: string;
  private readonly VWORLD_DOMAIN: string;

  constructor(
    private configService: ConfigService,
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
  ) {
    this.VWORLD_API_KEY = configService.get('VWORLD_API_KEY');
    this.VWORLD_DOMAIN = configService.get('VWORLD_DOMAIN');
  }

  private readonly MAX_MEMORY_USAGE_MB = 1024;
  private spatialIndex: Map<string, SpatialIndexEntry[]> = new Map();
  private optimizedSpatialIndex: {
    [prefix: string]: {
      entries: SpatialIndexEntry[];
      rtree: RBush<SpatialIndexEntry>;
    };
  } = {};
  private polygonRTrees: Map<string,RBush<{minX: number;minY: number;maxX: number;maxY: number;feature: any;}>> = new Map();
  private isIndexReady = false;
  private async loadPolygonIndexFile(dataType: DataType): Promise<IndexFile> {
    const indexPath = path.join(process.cwd(),'data','polygon','index',`${dataType}.index.json`,);
    const raw = await fs.promises.readFile(indexPath, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed?.entries || !Array.isArray(parsed.entries)) {
      throw Exception.InternalServerErrorException(`인덱스 파일 형식이 잘못되었습니다: ${indexPath}`);
    }
    return parsed as IndexFile;
  }

  async onModuleInit() {
    const startTime = Date.now();
    this.logger.log('공간 인덱스 파일 읽기 시작', {timestamp: new Date().toISOString(),});
    await this.initializeSpatialIndexWithRetry();
    const duration = Date.now() - startTime;
    this.isIndexReady = true;
    this.logger.log(`공간 인덱스 파일 읽기 완료`, {
      duration: `${duration}ms`,
      totalPrefixes: Object.keys(this.optimizedSpatialIndex).length,
      totalIndexes: this.spatialIndex.size,
      totalRTrees: this.polygonRTrees.size,
      memoryUsage: process.memoryUsage(),
    });
  }

  private async initializeSpatialIndexWithRetry(maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      await this.checkAndReleaseMemory();
      if (global.gc) {global.gc();}
      try {
        await this.initializeSpatialIndex();
        this.logger.log('공간 인덱스 파일 읽기 성공', {
          attempt,
          timestamp: new Date().toISOString(),
          totalPrefixes: Object.keys(this.optimizedSpatialIndex).length,
          totalIndexes: this.spatialIndex.size,
          memoryUsage: process.memoryUsage(),
        });
        return;
      } catch (error: any) {
        this.logger.error('공간 인덱스 파일 읽기 실패', {attempt,message: error?.message,stack: error?.stack,});
        if (attempt === maxRetries) throw error;
      }
    }
  }

  private async initializeSpatialIndex(): Promise<void> {
    const startTime = performance.now();
    await this.initializeDataTypeFromIndex('eupmeoundong');
    await this.initializeDataTypeFromIndex('sigungu');
    const endTime = performance.now();
    this.logger.log('공간 인덱스 초기화 완료', {
      duration: `${Math.round(endTime - startTime)}ms`,
      totalPrefixes: Object.keys(this.optimizedSpatialIndex).length,
      totalIndexes: this.spatialIndex.size,
      memoryUsage: process.memoryUsage(),
    });
  }

  private async initializeDataTypeFromIndex(dataType: DataType): Promise<void> {
    const index = await this.loadPolygonIndexFile(dataType);
    for (const e of index.entries) {
      const prefix = e.pnu || 'UNKNOWN';
      const relativePath = e.filePath.replace(/^src\//, '');
      const absPath = path.join(process.cwd(), relativePath);
      const entry: SpatialIndexEntry = {filePath: absPath,fileOffset: 0,fileLength: 0,
        boundingBox: {minLng: e.minX,minLat: e.minY,maxLng: e.maxX,maxLat: e.maxY,
        } as BoundingBox,pnu: prefix,minX: e.minX,minY: e.minY,maxX: e.maxX,maxY: e.maxY,
      };
      const list = this.spatialIndex.get(prefix) || [];
      list.push(entry);
      this.spatialIndex.set(prefix, list);

      if (!this.optimizedSpatialIndex[prefix]) {
        this.optimizedSpatialIndex[prefix] = {
          entries: [],
          rtree: new RBush(),
        };
      }
      this.optimizedSpatialIndex[prefix].rtree.insert(entry);
    }
    this.logger.log('인덱스 파일 로드 완료', {dataType,generatedAt: index.generatedAt,entries: index.entries.length,});
  }

  private async loadAndIndexPolygons(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      type RBushItem = {minX: number;minY: number;maxX: number;maxY: number;feature: any;};
      const rtree = new RBush<RBushItem>();
      const batchSize = 500;
      let features: RBushItem[] = [];
      const parser = JSONStream.parse('features.*');
      fs.createReadStream(filePath, { highWaterMark: 1024 * 1024 })
        .pipe(parser)
        .on('data', (feature: any) => {
          if (!feature?.geometry?.coordinates?.[0]) return;
          let coordinates: any;
          if (feature.geometry.type === 'MultiPolygon') {
            coordinates = feature.geometry.coordinates[0][0];
          } else if (feature.geometry.type === 'Polygon') {
            coordinates = feature.geometry.coordinates[0];
          } else {
            return;
          }
          if (!Array.isArray(coordinates) || coordinates.length === 0) return;
          const bounds = this.getBoundingBox(coordinates);
          features.push({
            minX: bounds.minX,
            minY: bounds.minY,
            maxX: bounds.maxX,
            maxY: bounds.maxY,
            feature,
          });
          if (features.length >= batchSize) {
            rtree.load(features);
            features = [];
          }
        })
        .on('end', () => {
          if (features.length > 0) rtree.load(features);
          this.polygonRTrees.set(filePath, rtree);
          resolve();
        })
        .on('error', (err) => reject(err));
    });
  }

  private filterCandidateFiles(
    bounds: { neLat: number; neLng: number; swLat: number; swLng: number },
    dataType: DataType,
  ): SpatialIndexEntry[] {
    const margin = 0.0001;
    const searchBounds = {
      minX: bounds.swLng - margin,
      minY: bounds.swLat - margin,
      maxX: bounds.neLng + margin,
      maxY: bounds.neLat + margin,
    };
    const candidateSet = new Set<string>();
    const candidates: SpatialIndexEntry[] = [];
    Object.keys(this.optimizedSpatialIndex).forEach((prefix) => {
      const rtree = this.optimizedSpatialIndex[prefix].rtree;
      const entries = rtree.search(searchBounds);
      for (const entry of entries) {
        if (!candidateSet.has(entry.filePath) && entry.filePath.includes(`/polygon/${dataType}/`)) {
          candidateSet.add(entry.filePath);
          candidates.push(entry);
        }
      }
    });
    return candidates;
  }

  private isFeatureInBounds(
    feature: any,
    bounds: { neLat: number; neLng: number; swLat: number; swLng: number },
  ): boolean {
    if (!feature?.geometry?.coordinates?.[0]) return false;
    let coordinates: any;
    if (feature.geometry.type === 'MultiPolygon') {
      coordinates = feature.geometry.coordinates[0][0];
    } else if (feature.geometry.type === 'Polygon') {
      coordinates = feature.geometry.coordinates[0];
    } else {
      return false;
    }
    if (!Array.isArray(coordinates)) return false;
    const margin = 0.0005;
    const searchBox = {
      minX: bounds.swLng - margin,
      minY: bounds.swLat - margin,
      maxX: bounds.neLng + margin,
      maxY: bounds.neLat + margin,
    };
    const featureBounds = this.getBoundingBox(coordinates);
    return !(
      featureBounds.maxX < searchBox.minX ||
      featureBounds.minX > searchBox.maxX ||
      featureBounds.maxY < searchBox.minY ||
      featureBounds.minY > searchBox.maxY
    );
  }

  async getSigunguPolygons(sigunguReq: sigunguReq): Promise<sigunguResponse[]> {
    const { neLat, neLng, swLat, swLng } = sigunguReq;

    if (!this.isIndexReady) {
      throw Exception.SuccessException('데이터 초기화 중입니다.');
    }

    this.isValidCoordinate(neLng, neLat);
    this.isValidCoordinate(swLng, swLat);

    const searchBounds = {
      minX: Math.min(swLng, neLng),
      minY: Math.min(swLat, neLat),
      maxX: Math.max(swLng, neLng),
      maxY: Math.max(swLat, neLat),
    };

    const features: sigunguResponse[] = [];
    const candidateFiles = this.filterCandidateFiles(
      { neLat, neLng, swLat, swLng },
      'sigungu',
    );

    try {
      for (const file of candidateFiles) {
        if (!this.polygonRTrees.has(file.filePath)) {await this.loadAndIndexPolygons(file.filePath);}
        const rtree = this.polygonRTrees.get(file.filePath);
        if (!rtree) continue;
        const candidates = rtree.search(searchBounds);
        for (const candidate of candidates) {
          if (this.isFeatureInBounds(candidate.feature, {neLat,neLng,swLat,swLng})) {
            const coordinates = candidate.feature.geometry.coordinates[0];
            features.push({
              admSectCode: candidate.feature.properties.ADM_SECT_C ?? '',
              sggNm: candidate.feature.properties.SGG_NM ?? '',
              coordinates,
              dealCount: candidate.feature.properties.DEAL_COUNT ?? 0,
              avgDealAmount_all:
                candidate.feature.properties.AVG_DEAL_AMOUNT_ALL ?? 0,
              avgDealAmount_m:
                candidate.feature.properties.AVG_DEAL_AMOUNT_M ?? 0,
              avgDealAmount_p:
                candidate.feature.properties.AVG_DEAL_AMOUNT_P ?? 0,
              point: candidate.feature.point ?? { coordinates: [0, 0] },
            });
          }
        }
      }
      if (features.length === 0) {
        throw Exception.SuccessException('해당 영역에 시군구 폴리곤이 없습니다.');
      }
      return features;
    } catch (error: any) {
      if (error instanceof Error) {
        if ('isServiceException' in error) throw error;
        throw Exception.InternalServerErrorException(error.message);
      }
      throw error;
    }
  }

  async getEupmeoundongPolygons(
    eupmeoundongReq: eupmeoundongReq,
  ): Promise<eupmeoundongResponse[]> {
    const { neLat, neLng, swLat, swLng } = eupmeoundongReq;
    if (!this.isIndexReady) {throw Exception.SuccessException('데이터 초기화 중입니다.');}
    this.isValidCoordinate(neLng, neLat);
    this.isValidCoordinate(swLng, swLat);
    const searchBounds = {
      minX: Math.min(swLng, neLng),
      minY: Math.min(swLat, neLat),
      maxX: Math.max(swLng, neLng),
      maxY: Math.max(swLat, neLat),
    };
    const features: eupmeoundongResponse[] = [];
    const candidateFiles = this.filterCandidateFiles({ neLat, neLng, swLat, swLng },'eupmeoundong');
    try {
      for (const file of candidateFiles) {
        if (!this.polygonRTrees.has(file.filePath)) {await this.loadAndIndexPolygons(file.filePath);}
        const rtree = this.polygonRTrees.get(file.filePath);
        if (!rtree) continue;
        const candidates = rtree.search(searchBounds);
        for (const candidate of candidates) {
          if (this.isFeatureInBounds(candidate.feature, {neLat,neLng,swLat,swLng})) {
            const coordinates = candidate.feature.geometry.coordinates[0];
            features.push({
              empcd: candidate.feature.properties.EMD_CD,
              coladmse: candidate.feature.properties.COL_ADM_SE,
              emdnm: candidate.feature.properties.EMD_NM,
              coordinates,
              dealCount: candidate.feature.properties.DEAL_COUNT || 0,
              avgDealAmount_all: candidate.feature.properties.AVG_DEAL_AMOUNT_ALL || 0,
              avgDealAmount_m: candidate.feature.properties.AVG_DEAL_AMOUNT_M || 0,
              avgDealAmount_p: candidate.feature.properties.AVG_DEAL_AMOUNT_P || 0,
              point: candidate.feature.point,
            });
          }
        }
      }
      if (features.length === 0) {throw Exception.SuccessException('해당 영역에 읍면동 폴리곤이 없습니다.');}
      return features;
    } catch (error: any) {
      if (error instanceof Error) {
        if ('isServiceException' in error) throw error;
        throw Exception.InternalServerErrorException(error.message);
      }
      throw error;
    }
  }

  async findPolygonsInPoint(pointReq: pointReq): Promise<pointRes[]> {
    const { lat, lng } = pointReq;
    this.isValidCoordinate(lng, lat);
    const pointResults = await this.searchPolygonsForPoint(lat, lng);
    if (pointResults.length === 0) {throw Exception.BadRequestException('해당 좌표에 포함된 폴리곤을 찾을 수 없습니다.');}
    return pointResults;
  }

  private async searchPolygonsForPoint(lat: number, lng: number): Promise<pointRes[]> {
    try {
      const url = `https://maps.apigw.ntruss.com/map-reversegeocode/v2/gc?coords=${lng},${lat}&orders=legalcode,admcode,addr,roadaddr&output=json`;
      const headers = {
        'X-NCP-APIGW-API-KEY-ID': process.env.NAVER_CLIENT_ID || '',
        'X-NCP-APIGW-API-KEY': process.env.NAVER_CLIENT_SECRET || '',
      };
      const response = await this.makeHttpRequest(url, headers);
      const data = JSON.parse(response);
      if (!data?.results?.[2]?.code?.id) return [];
      const addr = data.results[2];
      const pnu = addr.code.id + (addr.land.type === '' ? '0' : addr.land.type) + addr.land.number1.padStart(4, '0') + addr.land.number2.padStart(4, '0');
      const pnuPrefix5 = pnu.substring(0, 5);
      const pnuPrefix10 = pnu.substring(0, 10);
      const jsonFilePath = path.join(process.cwd(),'data','polygon','point','chunks',pnuPrefix5,`${pnuPrefix10}.json`);
      const jsonData = await fs.promises.readFile(jsonFilePath, 'utf8');
      const featureCollection = JSON.parse(jsonData);
      const matchingFeature = featureCollection.features.find((feature: any) => feature.properties.PNU === pnu);
      if (!matchingFeature) return [];
      return [this.transformFeatureToPointRes(matchingFeature)];
    } catch (error: any) {
      this.logger.error('포인트 폴리곤 검색 오류:', {error: error?.message,stack: error?.stack, lat, lng,});
      return [];
    }
  }

  private makeHttpRequest(url: string, headers: { [key: string]: string } = {}): Promise<string> {
    return new Promise((resolve, reject) => {
      const options = { headers };
      https.get(url, options, (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => resolve(data));
        })
        .on('error', (err) => reject(err));
    });
  }

  private transformFeatureToPointRes(feature: any): pointRes {
    if (!feature.geometry) return;
    const coordinates = feature.geometry.type === 'MultiPolygon' ? feature.geometry.coordinates[0][0].map(([lng, lat]) => [lng, lat]) : feature.geometry.coordinates[0].map(([lng, lat]) => [lng, lat]);
    const point = feature.point?.coordinates || [0, 0];
    return {
      pnu: feature.properties?.PNU,
      coordinates,
      areaName: feature.properties.AREANAME,
      landBookName: feature.properties.LANDBOOKNAME,
      jibunNum: feature.properties.JIBUNNUM,
      landType: feature.properties.LANDTYPE,
      landArea: feature.properties.LANDAREA,
      useLandName1: feature.properties.USELANDNAME1,
      useLandName2: feature.properties.USELANDNAME2,
      useLandState: feature.properties.USELANDSTATE,
      landHeight: feature.properties.LANDHEIGHT,
      landShape: feature.properties.LANDSHAPE,
      loadShape: feature.properties.LOADSHAPE,
      landPrice: feature.properties.LANDPRICE,
      asisPrices: {
        price1: feature.properties.LANDPRICE1,
        price2: feature.properties.LANDPRICE2,
        price3: feature.properties.LANDPRICE3,
        price4: feature.properties.LANDPRICE4,
      },
      realEstatePrices: feature.properties.DEALINGGBN === '' ? null : {
          dealingGbn: feature.properties.DEALINGGBN,
          deals: (() => {
            const dealCount = Object.keys(feature.properties).filter((key) => key.startsWith('DEALAMOUNT')).length;
            const deals = Array.from({ length: dealCount }, (_, i) => ({
              dealAmount: feature.properties[`DEALAMOUNT${i + 1}`],
              dealYear: feature.properties[`DEALYEAR${i + 1}`],
              dealMonth: feature.properties[`DEALMONTH${i + 1}`],
              dealDay: feature.properties[`DEALDAY${i + 1}`],
              estateAgentSggNm: feature.properties[`ESTATEAGENTSGGNM${i + 1}`],
              shareDealingType: feature.properties[`SHAREDEALINGTYPE${i + 1}`],
              cDealType: feature.properties[`CDEALTYPE${i + 1}`],
              cDealDay: feature.properties[`CDEALDAY${i + 1}`],
            })).filter((deal) => deal.dealAmount != null);

            const dealsByDate: Record<string, typeof deals> = deals.reduce(
              (acc, deal) => {
                const dateKey = `${deal.dealYear}-${deal.dealMonth}-${deal.dealDay}`;
                acc[dateKey] = acc[dateKey] || [];
                acc[dateKey].push(deal);
                return acc;
              },
              {},
            );

            return Object.values(dealsByDate).map((sameDateDeals) =>
              sameDateDeals.reduce((best, curr) => {
                const countEmpty = (deal: typeof curr) =>
                  Object.values(deal).filter((v) => v === '').length;
                return countEmpty(curr) < countEmpty(best) ? curr : best;
              }),
            );
          })(),
        },
      createdAt: feature.properties.CREATEDAT,
      shareState: feature.properties.SHARESTATE,
      sharePeople: feature.properties.SHAREPEOPLE,
      ageRange: feature.properties.AGERANGE,
      liveState: feature.properties.LIVESTATE,
      nationState: feature.properties.NATIONSTATE,
      diffShareState: feature.properties.DIFFSHARESTATE,
      diffShareDay: feature.properties.DIFFSHAREDAY,
    };
  }

  async getPublichouse(boundsReq: boundsReq): Promise<publichouseRes[]> {
    const margin = 0.001;
    const neLat = Number(boundsReq.neLat.toFixed(6));
    const neLng = Number(boundsReq.neLng.toFixed(6));
    const swLat = Number(boundsReq.swLat.toFixed(6));
    const swLng = Number(boundsReq.swLng.toFixed(6));

    this.isValidCoordinate(neLng, neLat);
    this.isValidCoordinate(swLng, swLat);

    const polygon = getPolygon({neLat: neLat + margin,neLng: neLng + margin,swLat: swLat - margin,swLng: swLng - margin});
    const wktPolygon = `POLYGON((${polygon}))`;
    try {
      const spatialCondition = sql`MBRINTERSECTS(ST_GeomFromText(${wktPolygon}), geo)`;
      const rows = (await this.db.select({code: schema.publichouse.code,name: schema.publichouse.name,status: schema.publichouse.status,geo: sql<string>`ST_AsGeoJSON(${schema.publichouse.geo})`,})
        .from(schema.publichouse)
        .where(spatialCondition)) as unknown as {code: string;name: string;status: string;geo: string;}[];
      const mappedRows = rows.map((item) => ({data: { code: item.code, name: item.name, status: item.status },geo: JSON.parse(item.geo)['coordinates'][0],}));
      return plainToInstance(publichouseRes, mappedRows);
    } catch (error: any) {
      this.logger.error('Failed to execute publichouse query', {error: error?.message,stack: error?.stack,});
      throw Exception.InternalServerErrorException('Failed to fetch publichouse: ' + error.message);
    }
  }

  private async checkAndReleaseMemory() {
    const memoryUsage = process.memoryUsage();
    const memoryUsageMB = memoryUsage.heapUsed / 1024 / 1024;
    if (memoryUsageMB > this.MAX_MEMORY_USAGE_MB) {
      this.logger.warn('메모리 사용량 초과. 리소스 정리', {currentMemory: memoryUsageMB.toFixed(2) + 'MB',memoryLimit: this.MAX_MEMORY_USAGE_MB + 'MB'});
      if (global.gc) {global.gc();}
    }
  }

  private isValidCoordinate(lng: number, lat: number): boolean {
    if (typeof lng !== 'number' || typeof lat !== 'number') {
      throw Exception.BadRequestException(`경도(lng)와 위도(lat)는 숫자 타입이어야 합니다. 받은 값: lng=${typeof lng}, lat=${typeof lat}`);
    }

    if (isNaN(lng) || isNaN(lat)) {
      throw Exception.BadRequestException(`경도(lng)와 위도(lat)는 유효한 숫자여야 합니다. 받은 값: lng=${lng}, lat=${lat}`);
    }

    if (lng < -180 || lng > 180) {
      throw Exception.BadRequestException(`경도(lng)는 -180에서 180 사이여야 합니다. 받은 값: lng=${lng}`);
    }

    if (lat < -90 || lat > 90) {
      throw Exception.BadRequestException(`위도(lat)는 -90에서 90 사이여야 합니다. 받은 값: lat=${lat}`);
    }
    return true;
  }

  private getBoundingBox(coordinates: [number, number][]): {minX: number;minY: number;maxX: number;maxY: number;} {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const [x, y] of coordinates) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }

    if (
      minX === Infinity ||
      minY === Infinity ||
      maxX === -Infinity ||
      maxY === -Infinity
    ) {
      throw Exception.InternalServerErrorException('유효한 좌표를 찾을 수 없음');
    }

    return { minX, minY, maxX, maxY };
  }
}
