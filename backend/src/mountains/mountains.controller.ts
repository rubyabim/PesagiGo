import { Controller, Get, Param } from '@nestjs/common';
import { MountainsService } from './mountains.service';

@Controller('api/mountains')
export class MountainsController {
  constructor(private readonly mountainsService: MountainsService) {}

  @Get()
  findAll() {
    return this.mountainsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mountainsService.findOne(id);
  }

  @Get(':id/trails')
  findTrails(@Param('id') id: string) {
    return this.mountainsService.findTrails(id);
  }
}