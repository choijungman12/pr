import { Module } from '@nestjs/common';
import { PolygonTransactionsService } from './service/polygon-transactions.service';
import { PolygonTransactionsController } from './controller/polygon-transactions.controller';
import { DrizzleModule } from 'src/drizzle/drizzle.module';

@Module({
  controllers: [PolygonTransactionsController],
  providers: [PolygonTransactionsService],
  imports: [DrizzleModule]
})
export class PolygonTransactionsModule {}
