import { Module } from '@nestjs/common';
import { WeatherModule } from './weather/weather.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, WeatherModule],
})
export class AppModule {}