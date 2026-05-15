import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { KakaoAuthUser } from 'src/auth/interface/auth.interface';

const KakaoStrategyBase = require('passport-kakao').Strategy;

@Injectable()
export class KakaoStrategy extends PassportStrategy(KakaoStrategyBase, 'kakao') {
  constructor() {
    const clientID = process.env.KAKAO_CLIENT_ID;
    const clientSecret = process.env.KAKAO_CLIENT_SECRET;
    const callbackURL = process.env.KAKAO_REDIRECT_URI;

    if (!clientID || !callbackURL) {
      throw new InternalServerErrorException(
        'KAKAO_CLIENT_ID/KAKAO_REDIRECT_URI is not configured',
      );
    }

    super({clientID,clientSecret,callbackURL});
  }

  validate(accessToken: string, refreshToken: string, profile: any,done: (error: any, user?: any) => void) {
    const user: KakaoAuthUser & {
      accessToken: string;
      refreshToken: string;
      // rawProfile: any;
    } = {
      provider: 'kakao',
      socialId: String(profile?.id || ''),
      email: profile?._json?.kakao_account?.email,
      gender: profile?._json?.kakao_account?.gender,
      name: profile?.displayName || profile?.username,
      accessToken,
      refreshToken,
      // rawProfile: profile,
    };

    done(null, user);
  }
}
