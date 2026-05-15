import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { ServiceExceptionFilter } from './common/exception/filter/service.exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV === 'production'
        ? ['error', 'warn']
        : ['log', 'error', 'warn', 'debug', 'verbose'],
    bufferLogs: true,
  });

  const allowedOrigins = [
    'https://prime2x.com',
    'https://dev.prime2x.com',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://192.168.0.140:3000',
  ];
  
  app.use(cookieParser());
  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
    maxAge: 86400,
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-HTTP-Method-Override',
      'x-requested-with'
    ],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  app.use(
    compression({
      level: 6,
      threshold: 1024,
      filter: (req: { headers: { [x: string]: any } }, res: any) => {
        if (req.headers['x-no-compression']) {
          return false;
        }
        return compression.filter(req, res);
      },
      beforeSend: (res: any) => {
        if (!res.getHeader('Cache-Control')) {
          res.setHeader('Cache-Control', 'public, max-age=31536000');
        }
      },
    }),
  );
  app.useGlobalFilters(new ServiceExceptionFilter());
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
