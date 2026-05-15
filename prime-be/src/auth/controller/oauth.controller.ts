import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import type { Request, Response } from 'express';
import { NaverAuthGuard } from '../guard/naver/naver.guard';
import { KakaoAuthGuard } from '../guard/kakao/kakao.guard';
import { GoogleAuthGuard } from '../guard/google/google.guard';
import {
  OAuthAppleCallbackReq,
  OAuthCallbackQueryReq,
  OAuthGoogleCallbackQueryReq,
  OAuthLoginQueryReq,
} from '../dto/auth-req.dto';

@Controller('oauth')
export class OAuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('naver/login')
  @UseGuards(NaverAuthGuard)
  naverLogin(@Query() _query: OAuthLoginQueryReq) {}

  @Get('naver/callback')
  @UseGuards(NaverAuthGuard)
  async naverCallback(@Req() req: Request, @Res() res: Response, @Query() query: OAuthCallbackQueryReq) {
    if (query.error) {
      return res.redirect(this.authService.buildOAuthErrorRedirectUrl(query));
    }
    const redirectUrl = await this.authService.handleSocialCallback((req as any).user, query, res);
    return res.redirect(redirectUrl);
  }

  @Get('kakao/login')
  @UseGuards(KakaoAuthGuard)
  kakaoLogin(@Query() _query: OAuthLoginQueryReq) {}

  @Get('kakao/callback')
  @UseGuards(KakaoAuthGuard)
  async kakaoCallback(@Req() req: Request, @Res() res: Response, @Query() query: OAuthCallbackQueryReq) {
    if (query.error) {
      return res.redirect(this.authService.buildOAuthErrorRedirectUrl(query));
    }
    const redirectUrl = await this.authService.handleSocialCallback((req as any).user, query, res);
    return res.redirect(redirectUrl);
  }

  @Get('google/login')
  @UseGuards(GoogleAuthGuard)
  googleLogin(@Query() _query: OAuthLoginQueryReq) {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: Request, @Res() res: Response, @Query() query: OAuthGoogleCallbackQueryReq ) {
    if (query.error) {
      return res.redirect(this.authService.buildOAuthErrorRedirectUrl(query));
    }
    const redirectUrl = await this.authService.handleSocialCallback((req as any).user, query, res);
    return res.redirect(redirectUrl);
  }

  // 애플 로그인 (별도 구분)
  @Get('apple/login')
  async appleLogin(@Query() query: OAuthLoginQueryReq, @Res() res: Response) {
    const url = await this.authService.getAppleAuthorizeUrl(query);
    return res.redirect(url);
  }

  @Post('apple/callback')
  async appleCallbackPost(@Body() body: OAuthAppleCallbackReq, @Res() res: Response) {
    const redirectUrl = await this.authService.handleAppleCallback(body, res);
    return res.redirect(redirectUrl);
  }
}
