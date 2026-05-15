import { Module } from '@nestjs/common';
import { PolygonController } from 'src/polygon/controller/polygon.controller';
import { PolygonService } from 'src/polygon/service/polygon.service';
import { DrizzleModule } from 'src/drizzle/drizzle.module';

@Module({
  controllers: [PolygonController],
  providers: [PolygonService],
  imports: [DrizzleModule],
})
export class PolygonModule {}
