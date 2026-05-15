import { sql } from 'drizzle-orm';
import { mysqlTable, unique, int, varchar, datetime, tinyint } from 'drizzle-orm/mysql-core';


export const socialAccount = mysqlTable(
  'social_account',
  {
    id: int().autoincrement().notNull().primaryKey(),
    userId: int('user_id').notNull(),
    socialUserEmail: varchar('social_user_email', { length: 64 }).notNull(),
    provider: varchar('provider', { length: 256 }).notNull(),
    client: varchar('client', { length:32 }).notNull(),
    socialId: varchar('social_id', { length: 256 }).notNull(),
    createdAt: datetime('created_at', { mode: 'string' }).notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: datetime('updated_at', { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).$onUpdateFn(() => sql`CURRENT_TIMESTAMP`),
    status: tinyint('status').default(1)
  },
  (table) => [
    unique('social_account_provider_client_social_id_unique').on(
      table.provider,
      table.client,
      table.socialId,
    ),
  ],
);
