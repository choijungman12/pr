import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { LandService } from '../service/land.service';
import { LandRegisterReq } from '../dto/land-req.dto';
import { BaseResponse } from 'src/util/base-response';
import { AdminJwtGuard } from 'src/sign/guard/admin-jwt.guard';

@Controller('land')
@UseGuards(AdminJwtGuard)
export class LandController {
  constructor(private readonly landService: LandService) {}

  @Get('table')
  async getRegionTable() {
    return BaseResponse.of(this.landService.getRegionTable());
  }

  @Post('register')
  @HttpCode(HttpStatus.OK)
  async register(@Body() body: LandRegisterReq) {
    return BaseResponse.of(await this.landService.register(body));
  }
}
