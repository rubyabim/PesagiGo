import { Module } from '@nestjs/common';
import { QuotasModule } from './quotas/quotas.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, QuotasModule],
})
export class AppModule {}