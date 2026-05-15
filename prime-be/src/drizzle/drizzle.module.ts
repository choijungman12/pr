import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, MySql2Database } from 'drizzle-orm/mysql2';
import * as mysql from 'mysql2/promise';
import * as schema from './schema/schema';
import { CommonDrizzleService } from './common.drizzle.service';

export const DRIZZLE = Symbol('DRIZZLE_CONNECTION');
@Module({
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const client = mysql.createPool({
          host: configService.get<string>('DB_HOSTNAME'),
          user: configService.get<string>('DB_USER'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_DATABASE'),
          port: Number(configService.get<string>('DB_PORT')),
          enableKeepAlive: true,
          keepAliveInitialDelay: 0,
          compress: true,
          connectionLimit: 10,
        });

        return drizzle(client, {
          schema,
          mode: 'default',
          logger: process.env.NODE_ENV !== 'production',
        }) as MySql2Database<typeof schema>;
      },
    },
    CommonDrizzleService,
  ],
  exports: [DRIZZLE, CommonDrizzleService],
})
export class DrizzleModule {}
