import { Controller, Get, Query } from '@nestjs/common';
import { WeatherService } from './weather.service';

@Controller('api/weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get()
  findAll(
    @Query('mountainId') mountainId?: string,
    @Query('date') date?: string,
  ) {
    return this.weatherService.findAll({ mountainId, date });
  }

  @Get('current')
  current(@Query('mountainId') mountainId?: string) {
    return this.weatherService.current({ mountainId });
  }

  @Get('forecast')
  forecast(
    @Query('mountainId') mountainId?: string,
    @Query('date') date?: string,
  ) {
    return this.weatherService.forecast({ mountainId, date });
  }
}
