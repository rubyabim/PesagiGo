import { Module } from '@nestjs/common';
import { MountainsController } from './mountains.controller';
import { MountainsService } from './mountains.service';
import { RoutesController } from './routes.controller';
import { BasecampController } from './basecamp.controller';

@Module({
  controllers: [MountainsController, RoutesController, BasecampController],
  providers: [MountainsService],
})
export class MountainsModule {}