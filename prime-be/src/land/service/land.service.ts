import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { LandRepository } from '../repository/land.repository';
import { LandRegisterReq } from '../dto/land-req.dto';
import { LandRegisterRes, LandTableRes } from '../dto/land-res.dto';

@Injectable()
export class LandService {
  private readonly logger = new Logger(LandService.name);

  constructor(private readonly landRepository: LandRepository) {}

  getRegionTable(): LandTableRes {
    return this.landRepository.listAvailableRegions();
  }

  async register(req: LandRegisterReq): Promise<LandRegisterRes> {
    const region = req.region?.trim();
    if (!region) {
      throw new BadRequestException('region이 비어 있습니다.');
    }

    const allowed = this.landRepository.listAvailableRegions();
    if (!allowed.includes(region)) {
      throw new BadRequestException(`지원되지 않는 region입니다: ${region}`);
    }

    const ring = this.normalizeRing(req.geo);
    if (ring.length < 3) {
      throw new BadRequestException('폴리곤 좌표가 최소 3개 이상이어야 합니다.');
    }

    const point = req.point;
    if (!Array.isArray(point) || point.length < 2) {
      throw new BadRequestException('point(lng, lat) 값이 필요합니다.');
    }

    // 폴리곤이 닫혀있지 않으면 첫 점을 끝에 추가
    const closed = this.ensureClosed(ring);
    const wkt = `POLYGON((${closed.map(([lng, lat]) => `${lng} ${lat}`).join(',')}))`;
    const pointText = `${point[0]},${point[1]}`;

    const data = req.data ?? {};
    const landType = String((data as any).land_type ?? '0');
    const landArea = Number((data as any).land_area ?? 0);
    const landName = this.buildLandName(data);
    const amount = this.toAmount(req.sale_price);
    const today = new Date();

    const realRegionId = await this.landRepository.insertRegionArticle({
      tableName: region,
      geoWkt: wkt,
      pointText,
      data: JSON.stringify({ ...data, sale_price: req.sale_price ?? null }),
      landType,
      landArea: Number.isFinite(landArea) ? landArea : 0,
      landName,
      amount,
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate(),
    });

    return LandRegisterRes.of(region, realRegionId);
  }

  private normalizeRing(geo: unknown): Array<[number, number]> {
    if (!Array.isArray(geo)) return [];
    const ring: Array<[number, number]> = [];
    for (const coord of geo as Array<any>) {
      if (Array.isArray(coord) && coord.length >= 2) {
        const lng = Number(coord[0]);
        const lat = Number(coord[1]);
        if (Number.isFinite(lng) && Number.isFinite(lat)) {
          ring.push([lng, lat]);
        }
      } else if (coord && typeof coord === 'object') {
        const lng = Number((coord as any).lng ?? (coord as any).x);
        const lat = Number((coord as any).lat ?? (coord as any).y);
        if (Number.isFinite(lng) && Number.isFinite(lat)) {
          ring.push([lng, lat]);
        }
      }
    }
    return ring;
  }

  private ensureClosed(ring: Array<[number, number]>): Array<[number, number]> {
    if (ring.length === 0) return ring;
    const [fx, fy] = ring[0];
    const [lx, ly] = ring[ring.length - 1];
    if (fx !== lx || fy !== ly) {
      return [...ring, ring[0]];
    }
    return ring;
  }

  private buildLandName(data: Record<string, unknown>): string {
    const areaName = String((data as any).area_name ?? '').trim();
    const jibun = String((data as any).jibun_num ?? '').trim();
    if (areaName && jibun) return `${areaName} ${jibun}`;
    return areaName || jibun || '미상';
  }

  private toAmount(sale: string | undefined): number {
    if (!sale) return 0;
    const digits = sale.replace(/[^0-9]/g, '');
    if (!digits) return 0;
    const n = Number(digits);
    return Number.isFinite(n) ? n : 0;
  }
}
