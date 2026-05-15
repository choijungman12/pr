import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { AuthController } from '../controller/auth.controller';
import { DrizzleModule } from 'src/drizzle/drizzle.module';
import { AuthRepository } from '../repository/auth.repository';
import { PassportModule } from '@nestjs/passport';
import { NaverStrategy } from '../strategy/naver/naver.strategy';
import { NaverAuthGuard } from '../guard/naver/naver.guard';
import { KakaoStrategy } from '../strategy/kakao/kakao.strategy';
import { KakaoAuthGuard } from '../guard/kakao/kakao.guard';
import { GoogleAuthGuard } from '../guard/google/google.guard';
import { GoogleStrategy } from '../strategy/google/google.strategy';
import { UserModule } from 'src/user/module/user.module';
import { OAuthController } from '../controller/oauth.controller';
import { JwtGuard } from '../guard/jwt/jwt.guard';

@Module({
  imports: [
    DrizzleModule,
    PassportModule.register({ session: false }),
    forwardRef(() => UserModule),
  ],
  controllers: [AuthController, OAuthController],
  providers: [
    AuthService,
    AuthRepository,
    NaverStrategy,
    NaverAuthGuard,
    KakaoStrategy,
    KakaoAuthGuard,
    GoogleStrategy,
    GoogleAuthGuard,
    JwtGuard,
  ],
  exports: [AuthService, JwtGuard, AuthRepository],
})
export class AuthModule {}
