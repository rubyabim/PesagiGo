import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, PaymentStatus, Prisma } from '@prisma/client';
import PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { PayBookingDto } from './dto/pay-booking.dto';

type TicketBooking = {
  id: string;
  userId: string;
  ticketCode: string | null;
  ticketPdfUrl: string | null;
  quantity: number;
  totalPrice: Prisma.Decimal;
  status: BookingStatus;
  createdAt: Date;
  session: {
    date: Date;
    mountain: {
      name: string;
      location: string;
    };
  };
  payment?: {
    method: string;
    paidAt: Date | null;
    providerRef: string | null;
  } | null;
};

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  private getBaseUrl() {
    return (
      process.env.PUBLIC_API_BASE_URL ??
      process.env.API_BASE_URL ??
      'http://localhost:3001'
    ).replace(/\/$/, '');
  }

  private buildTicketPdfUrl(bookingId: string) {
    return `${this.getBaseUrl()}/api/bookings/${bookingId}/ticket/pdf`;
  }

  private async ensureTicketMetadata(booking: TicketBooking) {
    if (booking.ticketCode && booking.ticketPdfUrl) {
      return booking;
    }

    const ticketCode = booking.ticketCode ?? this.generateTicketCode();
    const ticketPdfUrl =
      booking.ticketPdfUrl ?? this.buildTicketPdfUrl(booking.id);

    return this.prisma.booking.update({
      where: { id: booking.id },
      data: {
        ticketCode,
        ticketPdfUrl,
      },
      include: {
        session: {
          include: {
            mountain: true,
          },
        },
        payment: true,
      },
    });
  }

  private async loadPaidTicket(userId: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
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
      throw new ForbiddenException('Anda tidak memiliki akses ke tiket ini');
    }

    if (booking.status !== BookingStatus.PAID) {
      throw new BadRequestException(
        'Tiket tersedia setelah pembayaran berhasil',
      );
    }

    return this.ensureTicketMetadata(booking as TicketBooking);
  }

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
    const ticketPdfUrl = this.buildTicketPdfUrl(booking.id);

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
    const booking = await this.loadPaidTicket(userId, bookingId);

    return {
      ticketCode: booking.ticketCode,
      ticketPdfUrl: booking.ticketPdfUrl,
      bookingId: booking.id,
      mountain: booking.session.mountain.name,
      climbDate: booking.session.date,
      quantity: booking.quantity,
    };
  }

  async getTicketPdf(userId: string, bookingId: string) {
    const booking = await this.loadPaidTicket(userId, bookingId);

    if (!booking.ticketCode) {
      throw new BadRequestException('Kode tiket belum tersedia');
    }

    const pdfBuffer = await this.createTicketPdf(booking);

    return {
      buffer: pdfBuffer,
      filename: `ticket-${booking.ticketCode}.pdf`,
    };
  }

  private async createTicketPdf(booking: TicketBooking) {
    const qrBuffer = await QRCode.toBuffer(booking.ticketCode ?? booking.id, {
      errorCorrectionLevel: 'M',
      margin: 1,
      scale: 8,
    });

    return new Promise<Buffer>((resolve, reject) => {
      const document = new PDFDocument({
        size: 'A4',
        margin: 48,
        info: {
          Title: `PesagiGo Ticket ${booking.ticketCode ?? booking.id}`,
          Author: 'PesagiGo',
          Subject: 'Ticket pendakian',
        },
      });

      const chunks: Buffer[] = [];

      document.on('data', (chunk: Buffer | Uint8Array) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      });

      document.on('error', reject);
      document.on('end', () => {
        resolve(Buffer.concat(chunks));
      });

      document
        .fontSize(24)
        .fillColor('#0f172a')
        .text('PesagiGo Ticket', { align: 'center' });

      document
        .moveDown(0.5)
        .fontSize(12)
        .fillColor('#334155')
        .text('Tiket pendakian resmi', { align: 'center' });

      document.moveDown(1.5);

      document
        .roundedRect(48, 120, 499, 160, 12)
        .fillAndStroke('#f8fafc', '#cbd5e1');

      document.fillColor('#0f172a').fontSize(13);
      document.text(`Kode Tiket: ${booking.ticketCode ?? '-'}`, 68, 140);
      document.text(`Gunung: ${booking.session.mountain.name}`, 68, 165);
      document.text(`Lokasi: ${booking.session.mountain.location}`, 68, 190);
      document.text(
        `Tanggal Pendakian: ${booking.session.date.toLocaleString('id-ID', {
          dateStyle: 'full',
          timeStyle: 'short',
        })}`,
        68,
        215,
      );
      document.text(`Jumlah Tiket: ${booking.quantity}`, 68, 240);
      document.text(
        `Total Pembayaran: Rp${Number(booking.totalPrice).toLocaleString('id-ID')}`,
        68,
        265,
      );

      document.image(qrBuffer, 408, 140, { fit: [120, 120] });

      document.moveTo(48, 312).lineTo(547, 312).strokeColor('#cbd5e1').stroke();

      document
        .moveDown(2)
        .fontSize(11)
        .fillColor('#475569')
        .text(
          'Tunjukkan tiket ini beserta kode QR saat check-in di basecamp.',
          {
            align: 'center',
          },
        );

      document
        .moveDown(0.5)
        .text(`URL verifikasi: ${this.buildTicketPdfUrl(booking.id)}`, {
          align: 'center',
        });

      document.end();
    });
  }

  private generateTicketCode() {
    const random = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `PSG-${Date.now()}-${random}`;
  }
}
