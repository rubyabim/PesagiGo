import { Module } from '@nestjs/common';
import { BookingsModule } from '../bookings/bookings.module';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';

@Module({
  imports: [BookingsModule],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}