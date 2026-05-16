import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, PaymentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  private generateProviderRef() {
    return `PAY-${Date.now()}`;
  }

  async createPayment(userId: string, dto: CreatePaymentDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      include: {
        session: {
          include: {
            mountain: true,
          },
        },
        payment: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking tidak ditemukan');
    }

    if (booking.userId !== userId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke booking ini');
    }

    if (booking.status === BookingStatus.PAID) {
      return this.getPaymentByBooking(dto.bookingId);
    }

    const ticketCode = booking.ticketCode ?? this.generateTicketCode();
    const ticketPdfUrl =
      booking.ticketPdfUrl ?? this.buildTicketPdfUrl(booking.id);

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedBooking = await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: BookingStatus.PAID,
          ticketCode,
          ticketPdfUrl,
        },
      });

      await tx.payment.upsert({
        where: { bookingId: booking.id },
        create: {
          bookingId: booking.id,
          method: dto.method,
          amount: booking.totalPrice,
          status: PaymentStatus.SUCCESS,
          paidAt: new Date(),
          providerRef: this.generateProviderRef(),
        },
        update: {
          method: dto.method,
          amount: booking.totalPrice,
          status: PaymentStatus.SUCCESS,
          paidAt: new Date(),
          providerRef: this.generateProviderRef(),
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

  async getPayment(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: {
          include: {
            session: {
              include: {
                mountain: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment tidak ditemukan');
    }

    return {
      ...payment,
      amount: Number(payment.amount),
    };
  }

  async getPaymentByBooking(bookingId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { bookingId },
      include: {
        booking: {
          include: {
            session: {
              include: {
                mountain: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment tidak ditemukan');
    }

    return {
      ...payment,
      amount: Number(payment.amount),
    };
  }

  async webhook(dto: PaymentWebhookDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      include: { payment: true },
    });

    if (!booking) {
      throw new NotFoundException('Booking tidak ditemukan');
    }

    const status = this.mapWebhookStatus(dto.status);

    const payment = await this.prisma.payment.upsert({
      where: { bookingId: dto.bookingId },
      create: {
        bookingId: dto.bookingId,
        method: dto.method ?? 'online',
        amount: booking.totalPrice,
        status,
        paidAt: status === PaymentStatus.SUCCESS ? new Date() : null,
        providerRef: dto.providerRef ?? this.generateProviderRef(),
      },
      update: {
        method: dto.method ?? booking.payment?.method ?? 'online',
        amount: booking.totalPrice,
        status,
        paidAt: status === PaymentStatus.SUCCESS ? new Date() : null,
        providerRef: dto.providerRef ?? booking.payment?.providerRef ?? this.generateProviderRef(),
      },
    });

    if (status === PaymentStatus.SUCCESS) {
      await this.prisma.booking.update({
        where: { id: dto.bookingId },
        data: { status: BookingStatus.PAID },
      });
    }

    return {
      message: 'Webhook payment diterima',
      payment: {
        ...payment,
        amount: Number(payment.amount),
      },
    };
  }

  private mapWebhookStatus(status: string) {
    const normalized = status.toUpperCase();

    if (normalized === 'SUCCESS' || normalized === 'PAID') {
      return PaymentStatus.SUCCESS;
    }

    if (normalized === 'FAILED' || normalized === 'EXPIRED') {
      return PaymentStatus.FAILED;
    }

    return PaymentStatus.PENDING;
  }

  private buildTicketPdfUrl(bookingId: string) {
    const baseUrl = (
      process.env.PUBLIC_API_BASE_URL ??
      process.env.API_BASE_URL ??
      'http://localhost:3001'
    ).replace(/\/$/, '');

    return `${baseUrl}/api/bookings/${bookingId}/ticket/pdf`;
  }

  private generateTicketCode() {
    const random = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `PSG-${Date.now()}-${random}`;
  }
}