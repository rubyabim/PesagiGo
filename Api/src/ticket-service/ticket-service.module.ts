import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TicketsModule } from '../tickets/tickets.module';

@Module({
  imports: [AuthModule, TicketsModule],
})
export class TicketServiceModule {}