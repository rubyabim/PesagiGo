import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type FindWeatherParams = {
  mountainId?: string;
  date?: string;
};

@Injectable()
export class WeatherService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: FindWeatherParams) {
    const where: Prisma.WeatherForecastWhereInput = {};

    if (params.mountainId) {
      where.mountainId = params.mountainId;
    }

    if (params.date) {
      const dayStart = new Date(params.date);
      const dayEnd = new Date(params.date);
      dayEnd.setHours(23, 59, 59, 999);

      where.forecastDate = {
        gte: dayStart,
        lte: dayEnd,
      };
    }

    return this.prisma.weatherForecast.findMany({
      where,
      include: {
        mountain: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
      },
      orderBy: [{ forecastDate: 'asc' }, { createdAt: 'asc' }],
    });
  }
}
