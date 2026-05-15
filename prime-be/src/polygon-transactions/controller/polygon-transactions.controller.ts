import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PolygonTransactionsService } from '../service/polygon-transactions.service';
import { boundsReq, boundsRes, PolygonReq } from 'src/polygon/dto/polygon.dto';
import { BaseResponse } from 'src/util/base-response';


@Controller('polygon')
export class PolygonTransactionsController {
  constructor(private readonly polygonTransactionsService: PolygonTransactionsService) {}

  @Get("transactions")
  async getGeo(@Query() bounds: boundsReq): Promise<BaseResponse<boundsRes[]>> {
    return BaseResponse.of(await this.polygonTransactionsService.getGeo(bounds));
  }
 
  @Post("complex")
  async getComplexGeo(@Body() req: PolygonReq){
    return BaseResponse.of(await this.polygonTransactionsService.getComplexGeo(req));
  }
}
