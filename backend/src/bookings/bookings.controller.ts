import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { PayBookingDto } from './dto/pay-booking.dto';

@UseGuards(JwtAuthGuard)
@Controller('api/bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateBookingDto,
  ) {
    return this.bookingsService.createBooking(user.userId, dto);
  }

  @Get('my')
  myBookings(@CurrentUser() user: { userId: string }) {
    return this.bookingsService.myBookings(user.userId);
  }

  @Post(':id/pay')
  pay(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: PayBookingDto,
  ) {
    return this.bookingsService.payBooking(user.userId, id, dto);
  }

  @Get(':id/ticket')
  ticket(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.bookingsService.getTicket(user.userId, id);
  }

  @Get(':id/ticket/pdf')
  async ticketPdf(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    const ticket = await this.bookingsService.getTicketPdf(user.userId, id);

    return new StreamableFile(ticket.buffer, {
      type: 'application/pdf',
      disposition: `attachment; filename="${ticket.filename}"`,
    });
  }
}