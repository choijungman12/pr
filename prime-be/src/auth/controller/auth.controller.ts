import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import type { Response } from 'express';
import { LoginDataReq } from '../dto/auth-req.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 일반 로그인
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginDataReq, @Res() res: Response){
    const result = await this.authService.personalLogin(body, res)
    return res.json(result)
  }

  // 로그아웃
  @Get('logout')
  async logout(@Res() res: Response){
    const result = await this.authService.logout(res);
    return res.json(result);
  }
  
}
