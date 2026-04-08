import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MountainsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.mountain.findMany({
      include: {
        trails: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const mountain = await this.prisma.mountain.findUnique({
      where: { id },
      include: {
        trails: true,
        sessions: {
          orderBy: { date: 'asc' },
        },
      },
    });

    if (!mountain) {
      throw new NotFoundException('Data gunung tidak ditemukan');
    }

    return mountain;
  }

  async findTrails(mountainId: string) {
    const mountain = await this.prisma.mountain.findUnique({
      where: { id: mountainId },
    });

    if (!mountain) {
      throw new NotFoundException('Data gunung tidak ditemukan');
    }

    return this.prisma.trail.findMany({
      where: { mountainId },
      orderBy: { difficulty: 'asc' },
    });
  }
}