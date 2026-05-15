import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { NaverAuthUser } from 'src/auth/interface/auth.interface';

const NaverStrategyBase = require('passport-naver-v2').Strategy;

@Injectable()
export class NaverStrategy extends PassportStrategy(NaverStrategyBase, 'naver') {
  constructor() {
    const clientID = process.env.NAVER_LOGIN_CLIENT_ID;
    const clientSecret = process.env.NAVER_LOGIN_CLIENT_SECRET;
    const callbackURL = process.env.NAVER_LOGIN_REDIRECT_URI;

    if (!clientID || !clientSecret || !callbackURL) {
      throw new InternalServerErrorException(
        'NAVER_LOGIN_CLIENT_ID/NAVER_LOGIN_CLIENT_SECRET/NAVER_LOGIN_REDIRECT_URI is not configured',
      );
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
    });
  }

  validate(accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: any) => void) {
    const naverProfile = profile?._json?.response ?? profile;

    const user: NaverAuthUser & {
      accessToken: string;
      refreshToken: string;
      // rawProfile: any;
    } = {
      provider: 'naver',
      socialId: String(naverProfile?.id || profile?.id || '').trim(),
      email: naverProfile?.email || profile?.email,
      gender: naverProfile?.gender,
      name: naverProfile?.name || profile?.displayName || profile?.nickname,
      accessToken,
      refreshToken,
      // rawProfile: profile,
    };

    done(null, user);
  }
}
