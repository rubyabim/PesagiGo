import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('api/meta')
  getMeta() {
    return this.appService.getMeta();
  }

  @Get('api/health')
  getHealth() {
    return this.appService.getHealth();
  }
}
