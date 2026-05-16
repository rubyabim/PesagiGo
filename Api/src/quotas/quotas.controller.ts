import { Controller, Get, Param, Query } from '@nestjs/common';
import { QuotasService } from './quotas.service';

@Controller('api/quotas')
export class QuotasController {
  constructor(private readonly quotasService: QuotasService) {}

  @Get('check')
  check(
    @Query('sessionId') sessionId?: string,
    @Query('quantity') quantity?: string,
  ) {
    return this.quotasService.check(
      sessionId ?? '',
      quantity ? Number(quantity) : 1,
    );
  }

  @Get(':sessionId')
  detail(@Param('sessionId') sessionId: string) {
    return this.quotasService.detail(sessionId);
  }
}