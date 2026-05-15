import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { ADMIN_COOKIE_NAME, SignService } from '../service/sign.service';

@Injectable()
export class AdminJwtGuard implements CanActivate {
  constructor(private readonly signService: SignService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    const customHeader = request.headers['x-requested-with'];
    if (!customHeader) {
      throw new UnauthorizedException('Missing x-requested-with header');
    }

    const token = request.cookies?.[ADMIN_COOKIE_NAME];
    const adminLoginId = this.signService.verifyAdminCookie(token);
    (request as any).adminLoginId = adminLoginId;
    return true;
  }
}
