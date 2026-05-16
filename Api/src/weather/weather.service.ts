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

  private buildWhere(params: FindWeatherParams) {
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

    return where;
  }

  async findAll(params: FindWeatherParams) {
    return this.prisma.weatherForecast.findMany({
      where: this.buildWhere(params),
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

  async current(params: FindWeatherParams) {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    return this.prisma.weatherForecast.findFirst({
      where: {
        ...this.buildWhere({ mountainId: params.mountainId }),
        forecastDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
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

  async forecast(params: FindWeatherParams) {
    const where = this.buildWhere(params);

    if (!params.date) {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      where.forecastDate = { gte: start };
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
