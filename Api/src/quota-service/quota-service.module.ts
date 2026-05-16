import { Module } from '@nestjs/common';
import { QuotasModule } from '../quotas/quotas.module';

@Module({
  imports: [QuotasModule],
})
export class QuotaServiceModule {}