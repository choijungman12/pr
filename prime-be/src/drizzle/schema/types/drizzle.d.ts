import * as schema from '../schema/schema';
import { MySql2Database } from "drizzle-orm/mysql2";

export type DrizzleDB = MySql2Database<typeof schema>;