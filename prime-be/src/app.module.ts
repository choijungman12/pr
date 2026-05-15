import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PolygonModule } from './polygon/module/polygon.module';
import { GeocodingModule } from './geocoding/module/geocoding.module';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ServiceExceptionFilter } from './common/exception/filter/service.exception.filter';
import { DrizzleModule } from './drizzle/drizzle.module';
import { PolygonTransactionsModule } from './polygon-transactions/polygon-transactions.module';
import { AuthModule } from './auth/module/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { SignModule } from './sign/module/sign.module';
import { LandModule } from './land/module/land.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_TOKEN_SECRET_KEY,
    }),
    PolygonModule,
    GeocodingModule,
    DrizzleModule,
    PolygonTransactionsModule,
    AuthModule,
    SignModule,
    LandModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ServiceExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    }
  ],
})
export class AppModule {}
