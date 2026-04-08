import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'PesagiGo API is running';
  }

  getMeta() {
    return {
      app: 'PesagiGo',
      backend: 'NestJS',
      version: '1.0.0',
    };
  }

  getHealth() {
    return {
      status: 'ok',
      service: 'pesagigo-backend',
      timestamp: new Date().toISOString(),
    };
  }
}
