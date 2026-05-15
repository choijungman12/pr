import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { Response } from 'express';
import { SignRepository } from '../repository/sign.repository';
import { SignInReq } from '../dto/sign-req.dto';
import { SignInRes, SignOutRes } from '../dto/sign-res.dto';

const ADMIN_COOKIE_NAME = 'admin_action_asid';
const ADMIN_TOKEN_MAX_AGE_MS = 6 * 60 * 60 * 1000; // 6h

@Injectable()
export class SignService {
  private readonly logger = new Logger(SignService.name);

  constructor(
    private readonly signRepository: SignRepository,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(req: SignInReq, res: Response): Promise<SignInRes> {
    const adminRow = await this.signRepository.findByLoginId(req.loginId);
    if (!adminRow) {
      throw new NotFoundException('허용되지 않은 관리자 로그인 아이디입니다.');
    }

    if (adminRow.status !== 1) {
      throw new UnauthorizedException('비활성화된 관리자 계정입니다.');
    }

    const ok = await bcrypt.compare(req.password, adminRow.password);
    if (!ok) {
      throw new UnauthorizedException('아이디 또는 비밀번호가 일치하지 않습니다.');
    }

    this.issueAdminCookie(adminRow.loginId, res);
    return SignInRes.of(adminRow.loginId, adminRow.name ?? null);
  }

  signOut(res: Response): SignOutRes {
    res.clearCookie(ADMIN_COOKIE_NAME, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
    });
    return SignOutRes.ok();
  }

  issueAdminCookie(loginId: string, res: Response): string {
    const token = this.jwtService.sign(
      { adminLogin: true, loginId: String(loginId) },
      { secret: process.env.JWT_TOKEN_SECRET_KEY, expiresIn: '6h' },
    );

    res.cookie(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: ADMIN_TOKEN_MAX_AGE_MS,
      path: '/',
    });

    return token;
  }

  verifyAdminCookie(token: string | undefined): string {
    if (!token) {
      throw new UnauthorizedException('Missing admin session');
    }
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_TOKEN_SECRET_KEY,
      }) as Record<string, any>;
      if (!payload?.adminLogin || !payload?.loginId) {
        throw new UnauthorizedException('Invalid admin token');
      }
      return String(payload.loginId);
    } catch {
      throw new UnauthorizedException('Invalid or expired admin token');
    }
  }
}

export { ADMIN_COOKIE_NAME };
