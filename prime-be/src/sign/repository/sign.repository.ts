import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from 'src/drizzle/drizzle.module';
import { DrizzleDB } from 'src/drizzle/schema/types/drizzle';
import { admin } from 'src/drizzle/schema-common/admin.schema';

@Injectable()
export class SignRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findByLoginId(loginId: string) {
    const rows = await this.db
      .select({
        id: admin.id,
        loginId: admin.loginId,
        password: admin.password,
        name: admin.name,
        status: admin.status,
      })
      .from(admin)
      .where(eq(admin.loginId, loginId))
      .limit(1);

    return rows[0] ?? null;
  }
}
