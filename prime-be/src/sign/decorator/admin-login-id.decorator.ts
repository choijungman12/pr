import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import type { Request } from 'express';

export const AdminLoginId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return (request as any).adminLoginId as string;
  },
);
