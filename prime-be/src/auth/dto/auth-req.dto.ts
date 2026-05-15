import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { OAuthClient, SocialProvider } from '../interface/auth.interface';

export class OAuthLoginQueryReq {
  @IsOptional()
  @IsIn(['sem2em', 'prime'])
  client?: OAuthClient;

  @IsOptional()
  @IsString()
  state?: string;
}

export class OAuthSocialLinkStartQueryReq {
  @IsIn(['naver', 'kakao', 'google', 'apple'])
  provider!: SocialProvider;

  @IsOptional()
  @IsIn(['sem2em', 'prime'])
  client?: OAuthClient;
}

export class OAuthCallbackQueryReq {
  @IsOptional()
  @IsString()
  code?: string;

  @IsString()
  state!: string;

  @IsOptional()
  @IsIn(['sem2em', 'prime'])
  client?: OAuthClient;

  @IsOptional()
  @IsString()
  error?: string;

  @IsOptional()
  @IsString()
  error_description?: string;
}

export class OAuthGoogleCallbackQueryReq extends OAuthCallbackQueryReq {
  @IsOptional()
  @IsString()
  iss?: string;

  @IsOptional()
  @IsString()
  scope?: string;

  @IsOptional()
  @IsString()
  authuser?: string;

  @IsOptional()
  @IsString()
  prompt?: string;
}

export class OAuthAppleCallbackReq {
  @IsOptional()
  @IsString()
  code?: string;

  @IsString()
  state!: string;

  @IsOptional()
  @IsString()
  id_token?: string;

  @IsOptional()
  @IsString()
  user?: string;

  @IsOptional()
  @IsString()
  error?: string;

  @IsOptional()
  @IsString()
  error_description?: string;
}

export class LoginDataReq{
  @IsString()
  @IsNotEmpty()
  email: string;
  @IsString()
  @IsNotEmpty()
  password: string;
}
