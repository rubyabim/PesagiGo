import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuotasService {
  constructor(private readonly prisma: PrismaService) {}

  async detail(sessionId: string) {
    const session = await this.prisma.climbSession.findUnique({
      where: { id: sessionId },
      include: {
        mountain: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Sesi pendakian tidak ditemukan');
    }

    return {
      ...session,
      price: Number(session.price),
      quotaAvailable: session.quotaTotal - session.quotaBooked,
    };
  }

  async check(sessionId: string, quantity = 1) {
    const session = await this.prisma.climbSession.findUnique({
      where: { id: sessionId },
      include: {
        mountain: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Sesi pendakian tidak ditemukan');
    }

    const quotaAvailable = session.quotaTotal - session.quotaBooked;

    return {
      sessionId: session.id,
      mountainId: session.mountainId,
      quotaAvailable,
      requestedQuantity: quantity,
      canBook: quantity <= quotaAvailable,
    };
  }
}