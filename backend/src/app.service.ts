import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'PesagiGo API is running';
  }

  getHealth() {
    return {
      status: 'ok',
      service: 'pesagigo-backend',
      timestamp: new Date().toISOString(),
    };
  }
}
