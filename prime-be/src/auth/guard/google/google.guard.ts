import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from 'src/auth/service/auth.service';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  constructor(private readonly authService: AuthService) {
    super();
  }

  getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const rawState = req.query?.state;
    const state = Array.isArray(rawState)
      ? typeof rawState[0] === 'string'
        ? rawState[0]
        : undefined
      : typeof rawState === 'string'
        ? rawState
        : undefined;

    if (state) {
      return {
        state,
        scope: ['profile', 'email'],
      };
    }
    const isLoginRoute = req?.path?.endsWith('/login');

    if (!isLoginRoute) {
      return {};
    }

    const rawClient = req.query?.client;
    const client = Array.isArray(rawClient)
      ? typeof rawClient[0] === 'string'
        ? rawClient[0]
        : undefined
      : typeof rawClient === 'string'
        ? rawClient
        : undefined;
    const oauthClient = this.authService.normalizeOAuthClient(client);
    return {
      state: this.authService.createOAuthState(oauthClient),
      scope: ['profile', 'email'],
    };
  }
  handleRequest(err: any, user: any, _info: any, context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const isCallbackRoute = req?.path?.endsWith('/callback');
    const rawError = req?.query?.error;
    const hasOAuthError = Array.isArray(rawError)
      ? typeof rawError[0] === 'string' && rawError[0].length > 0
      : typeof rawError === 'string' && rawError.length > 0;

    if (isCallbackRoute && hasOAuthError) {
      return null;
    }

    if (err || !user) {
      throw err || new UnauthorizedException();
    }

    return user;
  }
}
