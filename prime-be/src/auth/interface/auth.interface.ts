export type SocialProvider = 'naver' | 'kakao' | 'google' | 'apple';
export type OAuthClient = 'prime';
export type OAuthFlow = 'login' | 'link';

export interface OAuthStateContext {
  client: OAuthClient;
  flow: OAuthFlow;
  loginId?: number;
}

export interface AppleStateRecord extends OAuthStateContext {
  nonce: string;
  createdAt: number;
}

export interface AuthUser {
  provider: SocialProvider;
  socialId: string;
  email?: string;
  gender?: string | null;
  name?: string;
}

export interface NaverAuthUser extends AuthUser {
  provider: 'naver';
}

export interface KakaoAuthUser extends AuthUser {
  provider: 'kakao';
}

export interface GoogleAuthUser extends AuthUser {
  provider: 'google';
}

export type SocialLoginStatus = 'social' | 'login_fail';
export type SocialLoginFailReason = 'social' | 'personal';

export interface UpsertSocialUserResult {
  status: SocialLoginStatus;
  userId: number;
  linkedEmail: string;
  reason?: SocialLoginFailReason;
  socialProvider?: SocialProvider;
}
