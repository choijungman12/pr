import { Controller, Get } from '@nestjs/common';
import { PolygonService } from 'src/polygon/service/polygon.service';
import { boundsReq, pointReq, pointRes } from 'src/polygon/dto/polygon.dto';
import { sigunguReq, sigunguResponse } from 'src/polygon/dto/sigungu.dto';
import { eupmeoundongReq, eupmeoundongResponse } from 'src/polygon/dto/eupmeoundong.dto';
import { publichouseRes } from 'src/polygon/dto/publichouse.dto';
import { BaseResponse } from 'src/util/base-response';
import { Query } from '@nestjs/common';
@Controller('polygon')
export class PolygonController {
  constructor(private readonly polygonService: PolygonService) {}

  @Get('point')
  async getPolygonsByPoint(@Query() pointReq: pointReq): Promise<BaseResponse<pointRes[]>> {
    return BaseResponse.of(await this.polygonService.findPolygonsInPoint(pointReq));
  }

  @Get('sgg')
  async getSigunguPolygons(@Query() sigunguReq: sigunguReq): Promise<BaseResponse<sigunguResponse[]>> {
    return BaseResponse.of(await this.polygonService.getSigunguPolygons(sigunguReq));
  }

  @Get('emd')
  async getEupMeounDongPolygons(@Query() eupmeoundongReq: eupmeoundongReq): Promise<BaseResponse<eupmeoundongResponse[]>> {
    return BaseResponse.of(await this.polygonService.getEupmeoundongPolygons(eupmeoundongReq));
  }
  @Get('publichouse')
  async getPublichouse(@Query() boundsReq: boundsReq): Promise<BaseResponse<publichouseRes[]>> {
    return BaseResponse.of(await this.polygonService.getPublichouse(boundsReq));
  }
}
