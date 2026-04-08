import { Controller, Get, Query } from '@nestjs/common';
import { SessionsService } from './sessions.service';

@Controller('api/sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  findAll(
    @Query('mountainId') mountainId?: string,
    @Query('date') date?: string,
  ) {
    return this.sessionsService.findAll({ mountainId, date });
  }
}