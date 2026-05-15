import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { GoogleAuthUser } from 'src/auth/interface/auth.interface';

const GoogleStrategyBase = require('passport-google-oauth20').Strategy;

@Injectable()
export class GoogleStrategy extends PassportStrategy(GoogleStrategyBase, 'google') {
  constructor() {
    const clientID = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const callbackURL = process.env.GOOGLE_REDIRECT_URI;

    if (!clientID || !clientSecret || !callbackURL) {
      throw new InternalServerErrorException(
        'GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET/GOOGLE_REDIRECT_URI is not configured',
      );
    }

    super({ clientID, clientSecret, callbackURL });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (error: any, user?: any) => void,
  ) {
    const socialId = String(profile?.id || profile?._json?.sub || '').trim();
    if (!socialId) {
      return done(new Error('Google profile is missing sub(id)'));
    }

    const email = profile?.emails?.[0]?.value || profile?._json?.email;
    const name =
      profile?.displayName ||
      profile?.name?.givenName ||
      profile?._json?.name ||
      profile?._json?.given_name;

    const user: GoogleAuthUser & {
      accessToken: string;
      refreshToken: string;
      // rawProfile: any;
    } = {
      provider: 'google',
      socialId,
      email,
      name,
      accessToken,
      refreshToken: refreshToken || '',
      // rawProfile: profile,
    };

    done(null, user);
  }
}
