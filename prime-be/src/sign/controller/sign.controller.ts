import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { SignService } from '../service/sign.service';
import { SignInReq } from '../dto/sign-req.dto';
import { BaseResponse } from 'src/util/base-response';

@Controller('sign')
export class SignController {
  constructor(private readonly signService: SignService) {}

  @Post('in')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() body: SignInReq, @Res() res: Response) {
    const result = await this.signService.signIn(body, res);
    return res.json(BaseResponse.of(result));
  }

  @Get('out')
  signOut(@Res() res: Response) {
    const result = this.signService.signOut(res);
    return res.json(BaseResponse.of(result));
  }
}
