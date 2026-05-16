import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { ManageQuotaDto } from './dto/manage-quota.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async createRoute(dto: CreateRouteDto) {
    return this.prisma.mountain.create({
      data: {
        name: dto.name,
        location: dto.location,
        description: `${dto.name} - Difficulty: ${dto.difficulty}, Duration: ${dto.duration}h`,
      },
    });
  }

  async updateRoute(id: string, dto: UpdateRouteDto) {
    const route = await this.prisma.mountain.findUnique({
      where: { id },
    });

    if (!route) {
      throw new NotFoundException('Rute tidak ditemukan');
    }

    return this.prisma.mountain.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.location && { location: dto.location }),
      },
    });
  }

  async deleteRoute(id: string) {
    const route = await this.prisma.mountain.findUnique({
      where: { id },
    });

    if (!route) {
      throw new NotFoundException('Rute tidak ditemukan');
    }

    return this.prisma.mountain.delete({ where: { id } });
  }

  async listRoutes() {
    return this.prisma.mountain.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async manageQuota(dto: ManageQuotaDto) {
    const session = await this.prisma.climbSession.findUnique({
      where: { id: dto.sessionId },
    });

    if (!session) {
      throw new NotFoundException('Sesi pendakian tidak ditemukan');
    }

    return this.prisma.climbSession.update({
      where: { id: dto.sessionId },
      data: {
        quotaTotal: dto.quotaTotal,
      },
    });
  }

  async listSessions() {
    return this.prisma.climbSession.findMany({
      include: {
        mountain: {
          select: { id: true, name: true },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async getBookingStats(sessionId?: string) {
    const where = sessionId ? { sessionId } : {};

    return this.prisma.booking.groupBy({
      by: ['status'],
      where,
      _count: true,
    });
  }

  async getPaymentStats(status?: string) {
    const where: any = {};

    return this.prisma.payment.groupBy({
      by: ['status'],
      where,
      _count: true,
    });
  }
}
