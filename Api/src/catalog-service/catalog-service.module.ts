import { Module } from '@nestjs/common';
import { MountainsModule } from '../mountains/mountains.module';

@Module({
  imports: [MountainsModule],
})
export class CatalogServiceModule {}