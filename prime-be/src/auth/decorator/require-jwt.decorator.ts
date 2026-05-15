import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard/jwt/jwt.guard';

export function RequireJwt() {
  return applyDecorators(UseGuards(JwtGuard));
}
