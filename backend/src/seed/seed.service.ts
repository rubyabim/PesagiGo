import { Injectable } from '@nestjs/common';
import { TrailDifficulty } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SeedService {
  constructor(private readonly prisma: PrismaService) {}

  async run() {
    const existingMountain = await this.prisma.mountain.findFirst({
      where: { name: 'Gunung Pesagi' },
    });

    if (existingMountain) {
      return {
        message: 'Seed sudah pernah dijalankan',
        mountainId: existingMountain.id,
      };
    }

    const mountain = await this.prisma.mountain.create({
      data: {
        name: 'Gunung Pesagi',
        location: 'Papahan, Lampung Barat',
        description:
          'Gunung Pesagi adalah destinasi pendakian favorit dengan panorama Bukit Barisan.',
        bestSeason: 'Mei - September',
      },
    });

    await this.prisma.trail.createMany({
      data: [
        {
          mountainId: mountain.id,
          name: 'Jalur Papahan',
          difficulty: TrailDifficulty.MEDIUM,
          distanceKm: 6.5,
          estimatedHours: 5.5,
          description: 'Jalur utama dengan pos resmi dan sumber air terbatas.',
        },
        {
          mountainId: mountain.id,
          name: 'Jalur Talang Rejo',
          difficulty: TrailDifficulty.HARD,
          distanceKm: 8.2,
          estimatedHours: 7,
          description: 'Jalur lebih menantang dengan elevasi curam dan hutan rapat.',
        },
      ],
    });

    const firstDate = new Date();
    firstDate.setDate(firstDate.getDate() + 7);
    firstDate.setHours(8, 0, 0, 0);

    const secondDate = new Date();
    secondDate.setDate(secondDate.getDate() + 14);
    secondDate.setHours(8, 0, 0, 0);

    await this.prisma.climbSession.createMany({
      data: [
        {
          mountainId: mountain.id,
          date: firstDate,
          quotaTotal: 120,
          price: 50000,
        },
        {
          mountainId: mountain.id,
          date: secondDate,
          quotaTotal: 120,
          price: 50000,
        },
      ],
    });

    return {
      message: 'Seed berhasil dibuat',
      mountainId: mountain.id,
    };
  }
}