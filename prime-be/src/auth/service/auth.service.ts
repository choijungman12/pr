import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { AuthRepository } from '../repository/auth.repository';
import { AppleStateRecord, AuthUser, OAuthClient, OAuthFlow, OAuthStateContext, SocialProvider, UpsertSocialUserResult } from '../interface/auth.interface';
import type { Response } from 'express';
import { LoginDataReq, OAuthAppleCallbackReq, OAuthCallbackQueryReq, OAuthLoginQueryReq } from '../dto/auth-req.dto';
import { createRandomBytes } from 'src/util/create-ramdom-bytes';
import { UserRepository } from 'src/user/repository/user.repository';
import * as bcrypt from 'bcrypt';
import * as dtoRes from '../dto/auth-res.dto';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly appleStateTtlMs = 5 * 60 * 1000; // 5분
  private readonly appleStateStore = new Map<string, AppleStateRecord>();

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  // Prime 단일 운영: client 입력값과 무관하게 prime으로 고정
  normalizeOAuthClient(client?: string): OAuthClient {
    void client;
    return 'prime';
  }

  // 일반 로그인 state는 prime으로만 생성
  createOAuthState(client: OAuthClient): string {
    return client;
  }

  private createOAuthLinkState(client: OAuthClient, loginId: number): string {
    const jwtSecret = process.env.JWT_TOKEN_SECRET_KEY;
    if (!jwtSecret) {
      throw new BadRequestException('JWT_TOKEN_SECRET_KEY is not configured');
    }

    return this.jwtService.sign(
      {
        tokenType: 'oauth_state',
        flow: 'link', client, loginId: String(loginId) },
      {
        secret: jwtSecret,  expiresIn: '10m',
      },
    );
  }

  private resolveOAuthState(state?: string): OAuthStateContext {
    if (!state) {
      throw new BadRequestException('Missing OAuth state');
    }

    if (state === 'sem2em' || state === 'prime') {
      return { client: 'prime', flow: 'login' };
    }

    const jwtSecret = process.env.JWT_TOKEN_SECRET_KEY;
    if (!jwtSecret) {
      throw new BadRequestException('JWT_TOKEN_SECRET_KEY is not configured');
    }

    let payload: Record<string, any>;
    try {
      payload = this.jwtService.verify(state, { secret: jwtSecret }) as Record<string, any>;
    } catch {
      throw new BadRequestException('Invalid OAuth state');
    }

    const flow = payload?.flow as OAuthFlow | undefined;
    const rawClient = payload?.client as OAuthClient | undefined;
    const loginId = Number(payload?.loginId);

    if (payload?.tokenType !== 'oauth_state') {
      throw new BadRequestException('Invalid OAuth state');
    }

    if (flow !== 'login' && flow !== 'link') {
      throw new BadRequestException('Invalid OAuth state flow');
    }

    if (rawClient !== 'prime') {
      throw new BadRequestException('Invalid OAuth state client');
    }

    const client: OAuthClient = 'prime';

    if (flow === 'link' && (!Number.isFinite(loginId) || loginId <= 0)) {
      throw new BadRequestException('Invalid OAuth state loginId');
    }

    return {
      client,
      flow,
      loginId: flow === 'link' ? loginId : undefined,
    };
  }

  getSocialLinkAuthorizeUrl(loginId: string, provider: SocialProvider, client?: string): string {
    const parsedLoginId = Number(loginId);
    if (!Number.isFinite(parsedLoginId) || parsedLoginId <= 0) {
      throw new BadRequestException('Invalid login session');
    }

    const oauthClient = this.normalizeOAuthClient(client);
    const state = this.createOAuthLinkState(oauthClient, parsedLoginId);
    const encodedState = encodeURIComponent(state);

    if (provider === 'apple') {
      return `/oauth/apple/login?state=${encodedState}`;
    }

    return `/oauth/${provider}/login?state=${encodedState}`;
  }

  private getFrontendRedirectUriByClient(client: OAuthClient, flow: OAuthFlow = 'login'): string {
    const loginRedirectUriByClient: Record<OAuthClient, string | undefined> = {
      prime: process.env.PRIME_LOGIN_SUCCESS_REDIRECT_URI
    };
    const linkRedirectUriByClient: Record<OAuthClient, string | undefined> = {
      prime: process.env.PRIME_SOCIAL_LINK_REDIRECT_URI,
    };

    const redirectUri = flow === 'link'
      ? (linkRedirectUriByClient[client] || loginRedirectUriByClient[client])
      : loginRedirectUriByClient[client];
    if (!redirectUri) {
      throw new BadRequestException('Frontend redirect uri is not configured');
    }

    return redirectUri;
  }

  private buildFrontendSuccessRedirectUrl(
    client: OAuthClient, flow: OAuthFlow = 'login'): string {
    const redirectUrl = new URL(this.getFrontendRedirectUriByClient(client, flow));
    redirectUrl.searchParams.set('status', 'success');
    return redirectUrl.toString();
  }

  private buildFrontendFailRedirectUrl(
    client: OAuthClient, reason: string, socialProvider?: SocialProvider, flow: OAuthFlow = 'login'): string {
    const redirectUrl = new URL(this.getFrontendRedirectUriByClient(client, flow));
    if (flow === 'login') {
      const normalizedPath = redirectUrl.pathname.replace(/\/+$/, '');
      if (!normalizedPath.endsWith('/login')) {
        redirectUrl.pathname = normalizedPath ? `${normalizedPath}/login` : '/login';
      }
    }
    redirectUrl.searchParams.set('status', 'fail');
    redirectUrl.searchParams.set('reason', reason);
    if (socialProvider) {
      redirectUrl.searchParams.set('socialProvider', socialProvider);
    }
    return redirectUrl.toString();
  }

  buildOAuthErrorRedirectUrl(query: OAuthCallbackQueryReq): string {
    try {
      const stateContext = this.resolveOAuthState(query.state);
      return this.getFrontendRedirectUriByClient(
        stateContext.client,
        'login',
      );
    } catch {
      this.logger.warn(
        'Failed to resolve OAuth state on error callback',
      );
      const fallbackClient = this.normalizeOAuthClient(query.client);
      return this.getFrontendRedirectUriByClient(fallbackClient, 'login');
    }
  }


  generateJwt(loginId: string | number, res: Response): string {
    const token = this.jwtService.sign(
      {secureAction: true,loginId: String(loginId)},
      {secret: process.env.JWT_TOKEN_SECRET_KEY, expiresIn: '6h'  },
    );

    const cookieOption = {
      httpOnly: true,
      secure: true,
      sameSite: 'strict' as const, 
      maxAge: 6 * 60 * 60 * 1000,
      path: '/',
    }
    res.cookie('action_asid', token, cookieOption);

    return token;
  }

  private normalizeEmail(value?: string | null): string {
    return String(value ?? '').trim().toLowerCase();
  }

  private getLinkedSocialProvider(user: Record<string, any>): SocialProvider | null {
    if (Number(user.socialNaver ?? 0) === 1) return 'naver';
    if (Number(user.socialKakao ?? 0) === 1) return 'kakao';
    if (Number(user.socialGoogle ?? 0) === 1) return 'google';
    if (Number(user.socialApple ?? 0) === 1) return 'apple';
    return null;
  }

  // social id 저장 및 로그인 업데이트
  async upsertSocialUser(user: AuthUser, client: OAuthClient): Promise<UpsertSocialUserResult> {
    if (!user.email) {
      throw new BadRequestException('Missing social email');
    }

    const socialResult = await this.authRepository.getSocialId(user.provider, user.socialId, client);
    if (socialResult && socialResult.length !== 0) {
      const linkedUserId = socialResult[0].userId;
      const linkedUser = await this.userRepository.getUserById(linkedUserId);
      if (!linkedUser || linkedUser.length === 0) {
        throw new BadRequestException('Linked social account has no active user');
      }

      return {
        status: 'social',
        userId: linkedUser[0].id,
        linkedEmail: linkedUser[0].email,
      };
    }

    const emailResult = await this.userRepository.getUserByEmail(user.email);
    if (!emailResult || emailResult.length === 0) {
      const userName = user.name?.trim() ?? null;
      const createdUserId = await this.userRepository.insertUserBySocial({
        provider: user.provider, email: user.email, gender: user.gender, name: userName,
      });
      await this.authRepository.insertSocialAccount(createdUserId, user.email, user.provider, user.socialId, client);

      return {
        status: 'social',
        userId: createdUserId,
        linkedEmail: user.email,
      };
    }

    const existUser = emailResult[0];
    if (Number(existUser.personalEmail ?? 0) === 1) {
      return {
        status: 'login_fail',
        userId: existUser.id,
        linkedEmail: existUser.email,
        reason: 'personal',
      };
    }

    const linkedProvider = this.getLinkedSocialProvider(existUser);
    if (linkedProvider && linkedProvider !== user.provider) {
      return {
        status: 'login_fail',
        userId: existUser.id,
        linkedEmail: existUser.email,
        reason: 'social',
        socialProvider: linkedProvider,
      };
    }

    await this.authRepository.insertSocialAccount(
      existUser.id,
      existUser.email,
      user.provider,
      user.socialId,
      client,
    );
    await this.userRepository.updateUserBySocial(existUser.id, user.provider);

    return {
      status: 'social',
      userId: existUser.id,
      linkedEmail: existUser.email,
    };
    
  }

  private async linkSocialAccountByLoginUser(
    user: AuthUser, client: OAuthClient, loginUserId: number, res: Response): Promise<string> {
    const loginUserResult = await this.userRepository.getUserById(loginUserId);
    if (!loginUserResult || loginUserResult.length === 0) {
      return this.buildFrontendFailRedirectUrl(client, 'not_found_user', undefined, 'link');
    }

    const loginUser = loginUserResult[0];
    if (Number(loginUser.personalEmail ?? 0) !== 1) {
      return this.buildFrontendFailRedirectUrl(client, 'not_personal_account', undefined, 'link');
    }

    const socialId = String(user.socialId ?? '').trim();
    const socialEmail = this.normalizeEmail(user.email);
    const accountEmail = this.normalizeEmail(loginUser.email);

    if (!socialId) {
      return this.buildFrontendFailRedirectUrl(client, 'missing_social_id', undefined, 'link');
    }

    if (!socialEmail) {
      return this.buildFrontendFailRedirectUrl(client, 'missing_social_email', undefined, 'link');
    }

    if (!accountEmail || accountEmail !== socialEmail) {
      return this.buildFrontendFailRedirectUrl(client, 'email_mismatch', undefined, 'link');
    }

    const socialResult = await this.authRepository.getSocialId(user.provider, socialId, client);
    if (socialResult && socialResult.length !== 0 && Number(socialResult[0].userId) !== loginUserId) {
      return this.buildFrontendFailRedirectUrl(client, 'social_in_use', undefined, 'link');
    }

    if (!socialResult || socialResult.length === 0) {
      await this.authRepository.insertSocialAccount(loginUserId, socialEmail, user.provider, socialId, client);
    }

    await this.userRepository.updateUserBySocial(loginUserId, user.provider);
    this.generateJwt(loginUserId, res);
    return this.buildFrontendSuccessRedirectUrl(client, 'link');
  }

  // 로그인 + 연동 콜백
  async handleSocialCallback(
    user: AuthUser,
    query: OAuthCallbackQueryReq,
    res: Response,
  ): Promise<string> {
    const stateContext = this.resolveOAuthState(query.state);
    if (query.client) {
      const normalizedClient = this.normalizeOAuthClient(query.client);
      if (normalizedClient !== stateContext.client) {
        throw new BadRequestException('OAuth client mismatch');
      }
    }

    if (stateContext.flow === 'link') {
      return this.linkSocialAccountByLoginUser(user, stateContext.client, Number(stateContext.loginId), res);
    }

    const loginStatus = await this.upsertSocialUser(user, stateContext.client);
    if (loginStatus.status !== 'social') {
      return this.buildFrontendFailRedirectUrl(
        stateContext.client,
        loginStatus.reason ?? 'social',
        loginStatus.socialProvider,
        'login',
      );
    }

    this.generateJwt(loginStatus.userId, res);
    return this.buildFrontendSuccessRedirectUrl(stateContext.client, 'login');
  }

  // 애플 로그인 로직 
  async getAppleAuthorizeUrl(query: OAuthLoginQueryReq) {
    const appleClientId = process.env.APPLE_CLIENT_ID;
    const appleRedirectUri = process.env.APPLE_REDIRECT_URI;

    if (!appleClientId || !appleRedirectUri) {
      throw new BadRequestException(
        'APPLE_CLIENT_ID/APPLE_REDIRECT_URI is not configured',
      );
    }

    const stateContext = query.state
      ? this.resolveOAuthState(query.state)
      : { client: this.normalizeOAuthClient(query.client), flow: 'login' as OAuthFlow };
    const state = createRandomBytes();
    const nonce = createRandomBytes();
    this.saveAppleStateNonce(state, nonce, stateContext);

    const url = new URL('https://appleid.apple.com/auth/authorize');
    url.searchParams.set('response_type', 'code id_token');
    url.searchParams.set('response_mode', 'form_post');
    url.searchParams.set('client_id', appleClientId);
    url.searchParams.set('redirect_uri', appleRedirectUri);
    url.searchParams.set('scope', 'name email');
    url.searchParams.set('state', state);
    url.searchParams.set('nonce', nonce);

    return url.toString();
  }

  // 애플 로그인 콜백
  async handleAppleCallback(callback: OAuthAppleCallbackReq, res: Response): Promise<string> {
    if (callback.error) {
      const stateRecord = this.consumeAppleStateNonce(callback.state);
      return this.getFrontendRedirectUriByClient(stateRecord.client, 'login');
    }

    // 호출 state 검증
    const stateRecord = this.consumeAppleStateNonce(callback.state);
    if (!callback.id_token) {
      throw new BadRequestException('Missing Apple id_token');
    }

    const applePayload = this.decodeJwtPayload(callback.id_token);
    if (!applePayload?.sub) {
      throw new BadRequestException('Invalid Apple id_token');
    }

    if (applePayload.nonce !== stateRecord.nonce) {
      throw new BadRequestException('Invalid Apple nonce');
    }

    const appleUserInfo = this.parseAppleUserInfo(callback.user);
    const user: AuthUser = {
      provider: 'apple',
      socialId: String(applePayload.sub),
      email:
        typeof applePayload.email === 'string'
          ? applePayload.email
          : undefined,
      name: appleUserInfo?.name,
    };

    if (stateRecord.flow === 'link') {
      return this.linkSocialAccountByLoginUser(
        user,
        stateRecord.client,
        Number(stateRecord.loginId),
        res,
      );
    }

    const loginStatus = await this.upsertSocialUser(user, stateRecord.client);
    if (loginStatus.status !== 'social') {
      return this.buildFrontendFailRedirectUrl(
        stateRecord.client,
        loginStatus.reason ?? 'social',
        loginStatus.socialProvider,
        'login',
      );
    }

    this.generateJwt(loginStatus.userId, res);
    return this.buildFrontendSuccessRedirectUrl(stateRecord.client, 'login')
  }

  // apple 전송 state, nonce => 차후 session등 검증 필요
  private saveAppleStateNonce(state: string, nonce: string, stateContext: OAuthStateContext) {
    this.appleStateStore.set(state, {
      client: stateContext.client,
      flow: stateContext.flow,
      loginId: stateContext.loginId,
      nonce,
      createdAt: Date.now(),
    });
  }

  private consumeAppleStateNonce(state: string): AppleStateRecord {
    const record = this.appleStateStore.get(state);
    this.appleStateStore.delete(state);

    if (!record) {
      throw new BadRequestException('Invalid Apple state');
    }

    if (Date.now() - record.createdAt > this.appleStateTtlMs) {
      throw new BadRequestException('Expired Apple state');
    }

    return record;
  }

  // 애플 jwt token decode
  private decodeJwtPayload(token: string): Record<string, any> {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new BadRequestException('Invalid JWT format');
    }

    const payload = parts[1];
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  }

  // 애플 사용자 정보
  private parseAppleUserInfo(user?: string): { name?: string } | undefined {
    if (!user) {
      return undefined;
    }

    try {
      const parsed = JSON.parse(user);
      const firstName = parsed?.name?.firstName;
      const lastName = parsed?.name?.lastName;
      if (!firstName && !lastName) {
        return undefined;
      }

      return { name: [firstName, lastName].filter(Boolean).join(' ').trim() };
    } catch {
      return undefined;
    }
  }

  async personalLogin(body: LoginDataReq, res: Response):Promise<dtoRes.PersonalLoginRes>{
    const userInfo = await this.userRepository.getUserByEmail(body.email);
    if (!userInfo || userInfo.length === 0) {
      return dtoRes.PersonalLoginRes.fail('email');
    }

    const linkedProvider = this.getLinkedSocialProvider(userInfo[0]);

    const hashedPassword = userInfo[0].password;
    if (!hashedPassword) {
      return dtoRes.PersonalLoginRes.fail('social');
    }

    const isPasswordValid = await bcrypt.compare(body.password, hashedPassword);
    if (!isPasswordValid) {
      return dtoRes.PersonalLoginRes.fail('password');
    }

    this.generateJwt(userInfo[0].id, res);

    return dtoRes.PersonalLoginRes.success(
      linkedProvider ? 'social' : 'personal',
      {
        userName: userInfo[0].name ?? null,
        userEmail: userInfo[0].email ?? null,
      },
    );
  }

  async logout(res: Response): Promise<dtoRes.LogoutRes> {
    const cookieBase = {
      httpOnly: true,
      secure: false,
      sameSite: 'strict' as const,
      path: '/',
    };

    res.clearCookie('action_asid', cookieBase);

    return dtoRes.LogoutRes.of();
  }
}
