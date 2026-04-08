import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type FindSessionsParams = {
  mountainId?: string;
  date?: string;
};

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: FindSessionsParams) {
    const where: Prisma.ClimbSessionWhereInput = {};

    if (params.mountainId) {
      where.mountainId = params.mountainId;
    }

    if (params.date) {
      const dayStart = new Date(params.date);
      const dayEnd = new Date(params.date);
      dayEnd.setHours(23, 59, 59, 999);

      where.date = {
        gte: dayStart,
        lte: dayEnd,
      };
    }

    const sessions = await this.prisma.climbSession.findMany({
      where,
      include: {
        mountain: true,
      },
      orderBy: { date: 'asc' },
    });

    return sessions.map((session) => ({
      ...session,
      price: Number(session.price),
      quotaAvailable: session.quotaTotal - session.quotaBooked,
    }));
  }
}