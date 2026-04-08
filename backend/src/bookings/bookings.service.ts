import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, PaymentStatus } from '../generated/prisma/enums';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { PayBookingDto } from './dto/pay-booking.dto';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async createBooking(userId: string, dto: CreateBookingDto) {
    const session = await this.prisma.climbSession.findUnique({
      where: { id: dto.sessionId },
      include: {
        mountain: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Sesi pendakian tidak ditemukan');
    }

    const quotaAvailable = session.quotaTotal - session.quotaBooked;
    if (dto.quantity > quotaAvailable) {
      throw new BadRequestException('Kuota tidak mencukupi');
    }

    const price = Number(session.price);
    const totalPrice = new Prisma.Decimal(price * dto.quantity);

    const booking = await this.prisma.$transaction(async (tx) => {
      await tx.climbSession.update({
        where: { id: session.id },
        data: {
          quotaBooked: {
            increment: dto.quantity,
          },
        },
      });

      return tx.booking.create({
        data: {
          userId,
          sessionId: session.id,
          quantity: dto.quantity,
          totalPrice,
        },
        include: {
          session: {
            include: {
              mountain: true,
            },
          },
        },
      });
    });

    return {
      ...booking,
      totalPrice: Number(booking.totalPrice),
    };
  }

  async myBookings(userId: string) {
    const bookings = await this.prisma.booking.findMany({
      where: { userId },
      include: {
        session: {
          include: {
            mountain: true,
          },
        },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return bookings.map((booking) => ({
      ...booking,
      totalPrice: Number(booking.totalPrice),
      payment: booking.payment
        ? {
            ...booking.payment,
            amount: Number(booking.payment.amount),
          }
        : null,
    }));
  }

  async payBooking(userId: string, bookingId: string, dto: PayBookingDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        session: {
          include: {
            mountain: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking tidak ditemukan');
    }

    if (booking.userId !== userId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke booking ini');
    }

    if (booking.status === BookingStatus.PAID) {
      return {
        message: 'Booking sudah dibayar',
        booking,
      };
    }

    const ticketCode = this.generateTicketCode();
    const ticketPdfUrl = `https://pesagigo.local/tickets/${ticketCode}.pdf`;

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.PAID,
          ticketCode,
          ticketPdfUrl,
        },
      });

      await tx.payment.upsert({
        where: { bookingId },
        create: {
          bookingId,
          method: dto.method,
          amount: booking.totalPrice,
          status: PaymentStatus.SUCCESS,
          paidAt: new Date(),
          providerRef: `PAY-${Date.now()}`,
        },
        update: {
          method: dto.method,
          amount: booking.totalPrice,
          status: PaymentStatus.SUCCESS,
          paidAt: new Date(),
          providerRef: `PAY-${Date.now()}`,
        },
      });

      return updatedBooking;
    });

    return {
      message: 'Pembayaran berhasil',
      booking: {
        ...updated,
        totalPrice: Number(updated.totalPrice),
      },
    };
  }

  async getTicket(userId: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        session: {
          include: {
            mountain: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking tidak ditemukan');
    }

    if (booking.userId !== userId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke tiket ini');
    }

    if (booking.status !== BookingStatus.PAID) {
      throw new BadRequestException('Tiket tersedia setelah pembayaran berhasil');
    }

    return {
      ticketCode: booking.ticketCode,
      ticketPdfUrl: booking.ticketPdfUrl,
      bookingId: booking.id,
      mountain: booking.session.mountain.name,
      climbDate: booking.session.date,
      quantity: booking.quantity,
    };
  }

  private generateTicketCode() {
    const random = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `PSG-${Date.now()}-${random}`;
  }
}