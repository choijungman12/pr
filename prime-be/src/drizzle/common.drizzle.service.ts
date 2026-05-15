
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, MySql2Database } from 'drizzle-orm/mysql2';
import { createPool } from 'mysql2/promise';
import * as schema from './schema-common/schema';

@Injectable()
export class CommonDrizzleService {
  public readonly commonDrizzleDatabase: MySql2Database<typeof schema>;

  constructor(private readonly configService: ConfigService) {
    const pool = createPool({
      host: this.configService.get<string>('COMMON_DB_HOST'),
      user: this.configService.get<string>('COMMON_DB_USER'),
      password: this.configService.get<string>('COMMON_DB_PASSWORD'),
      database: this.configService.get<string>('COMMON_DB_NAME'),
      port: Number(this.configService.get<string>('COMMON_DB_PORT') ?? 3306),
      charset: 'utf8mb4',
    });

    this.commonDrizzleDatabase = drizzle(pool, { schema, mode: 'default' });
  }
}
