import { sql } from 'drizzle-orm';
import { mysqlTable, unique, int, varchar, datetime, tinyint } from 'drizzle-orm/mysql-core';

export const admin = mysqlTable(
  'admin',
  {
    id: int().autoincrement().notNull().primaryKey(),
    loginId: varchar('login_id', { length: 64 }).notNull(),
    password: varchar('password', { length: 256 }).notNull(),
    name: varchar('name', { length: 64 }),
    createdAt: datetime('created_at', { mode: 'string' }).notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: datetime('updated_at', { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).$onUpdateFn(() => sql`CURRENT_TIMESTAMP`),
    status: tinyint('status').default(1),
  },
  (table) => [unique('admin_login_id_unique').on(table.loginId)],
);
