import { Controller, Get, Param } from '@nestjs/common';
import { MountainsService } from './mountains.service';

@Controller('api/basecamp')
export class BasecampController {
  constructor(private readonly mountainsService: MountainsService) {}

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.mountainsService.findOne(id);
  }

  @Get(':id/map')
  async map(@Param('id') id: string) {
    const mountain = await this.mountainsService.findOne(id);

    return {
      id: mountain.id,
      name: mountain.name,
      location: mountain.location,
      mapLocation: mountain.location,
    };
  }
}