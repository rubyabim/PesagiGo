import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookingsService } from '../bookings/bookings.service';
import { ScanTicketDto } from './dto/scan-ticket.dto';

@Injectable()
export class TicketsService {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly prisma: PrismaService,
  ) {}

  history(userId: string) {
    return this.bookingsService.myBookings(userId);
  }

  getTicket(userId: string, bookingId: string) {
    return this.bookingsService.getTicket(userId, bookingId);
  }

  async downloadPdf(userId: string, bookingId: string) {
    return this.bookingsService.getTicketPdf(userId, bookingId);
  }

  async scanTicket(user: { userId: string; role: string }, dto: ScanTicketDto) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Hanya admin yang dapat scan tiket');
    }

    const booking = await this.prisma.booking.findUnique({
      where: { ticketCode: dto.code },
      include: {
        user: true,
        session: {
          include: {
            mountain: true,
          },
        },
        payment: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Tiket tidak ditemukan');
    }

    return {
      ticketCode: booking.ticketCode,
      status: booking.status,
      bookingId: booking.id,
      mountain: booking.session.mountain.name,
      climbDate: booking.session.date,
      holder: booking.user.fullName,
      paymentStatus: booking.payment?.status ?? null,
    };
  }
}