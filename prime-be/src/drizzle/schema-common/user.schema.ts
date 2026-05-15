import { sql } from 'drizzle-orm';
import { mysqlTable, unique, int, varchar, datetime, tinyint } from 'drizzle-orm/mysql-core';

export const user = mysqlTable(
  'user',
  {
    id: int().autoincrement().notNull().primaryKey(),
    email: varchar('email', { length: 64 }).notNull(),
    password: varchar('password', { length: 256 }),
    phone: varchar('phone', { length: 32 }),
    gender: varchar('gender', { length: 8 }),
    name: varchar('name', { length: 32 }),
    personalEmail: tinyint('personal_email').default(0),
    socialNaver: tinyint('social_naver').default(0),
    socialKakao: tinyint('social_kakao').default(0),
    socialGoogle: tinyint('social_google').default(0),
    socialApple: tinyint('social_apple').default(0),
    createdAt: datetime('created_at', { mode: 'string' }).notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: datetime('updated_at', { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).$onUpdateFn(() => sql`CURRENT_TIMESTAMP`),
    status: tinyint('status').default(1)
  },
  (table) => [unique('user_email_unique').on(table.email)],
);
