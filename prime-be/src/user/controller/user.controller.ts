import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { UserService } from '../service/user.service';
import { SignUpReq, SocialLinkReq} from '../dto/user-req.dto';
import { RequireJwt } from 'src/auth/decorator/require-jwt.decorator';
import { LoginId } from 'src/auth/decorator/login-id.decorator';


@Controller('user')
export class UserController {
  constructor(private readonly userService:UserService) {}

  // 일반 회원가입
  @Post('sign-up')
  async signUp(@Body() body: SignUpReq, @Res() res: Response){
    const signUpResult = await this.userService.signUp(body, res)
    return res.json(signUpResult)
  }

  // 개인정보 조회 api (이름, 이메일)
  @Get('info')
  @RequireJwt()
  async getUserInfo(@LoginId() loginId: string, @Res() res: Response){
    const userInfoResult = await this.userService.getUser(loginId)
    return res.json(userInfoResult)
  }
  
  // 소셜 로그인 연동
  @Post('social/link')
  @RequireJwt()
  @HttpCode(HttpStatus.OK)
  async userSocialLink(@LoginId() loginId: string, @Body() body: SocialLinkReq){
    return await this.userService.socialLink(loginId, body);
  }
}
