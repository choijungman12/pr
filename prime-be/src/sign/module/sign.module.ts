import { Module } from '@nestjs/common';
import { DrizzleModule } from 'src/drizzle/drizzle.module';
import { SignController } from '../controller/sign.controller';
import { SignService } from '../service/sign.service';
import { SignRepository } from '../repository/sign.repository';
import { AdminJwtGuard } from '../guard/admin-jwt.guard';

@Module({
  imports: [DrizzleModule],
  controllers: [SignController],
  providers: [SignService, SignRepository, AdminJwtGuard],
  exports: [SignService, SignRepository, AdminJwtGuard],
})
export class SignModule {}
