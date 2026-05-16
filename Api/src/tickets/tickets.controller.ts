import { Body, Controller, Get, Param, Post, StreamableFile, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ScanTicketDto } from './dto/scan-ticket.dto';
import { TicketsService } from './tickets.service';

@UseGuards(JwtAuthGuard)
@Controller('api/tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get('history')
  history(@CurrentUser() user: { userId: string }) {
    return this.ticketsService.history(user.userId);
  }

  @Get(':id')
  getTicket(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.ticketsService.getTicket(user.userId, id);
  }

  @Get(':id/pdf')
  async downloadPdf(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    const ticket = await this.ticketsService.downloadPdf(user.userId, id);

    return new StreamableFile(ticket.buffer, {
      type: 'application/pdf',
      disposition: `attachment; filename="${ticket.filename}"`,
    });
  }

  @Post('scan')
  scan(@CurrentUser() user: { userId: string; role: string }, @Body() dto: ScanTicketDto) {
    return this.ticketsService.scanTicket(user, dto);
  }
}