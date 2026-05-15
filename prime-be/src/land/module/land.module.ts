import { Module } from '@nestjs/common';
import { DrizzleModule } from 'src/drizzle/drizzle.module';
import { SignModule } from 'src/sign/module/sign.module';
import { LandController } from '../controller/land.controller';
import { LandService } from '../service/land.service';
import { LandRepository } from '../repository/land.repository';

@Module({
  imports: [DrizzleModule, SignModule],
  controllers: [LandController],
  providers: [LandService, LandRepository],
})
export class LandModule {}
