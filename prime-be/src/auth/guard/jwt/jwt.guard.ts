import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request, Response } from 'express';
import { AuthService } from 'src/auth/service/auth.service';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    return this.verifyJwt(request, response);
  }

  private verifyJwt(req: Request, res: Response): boolean {
    const customHeader = req.headers['x-requested-with'];
    if (!customHeader) {
      throw new UnauthorizedException('Missing x-requested-with header');
    }

    const token = req.cookies?.['action_asid'];
    if (!token) {
      throw new UnauthorizedException('Missing action_asid');
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_TOKEN_SECRET_KEY,
      }) as Record<string, any>;

      if (!payload?.loginId) {
        throw new UnauthorizedException('Invalid JWT payload');
      }

      req['loginId'] = String(payload.loginId);
      this.authService.generateJwt(String(payload.loginId), res);
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
