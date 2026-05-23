import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GatewayService {
  private readonly serviceUrls = {
    auth: process.env.AUTH_SERVICE_URL ?? 'http://localhost:3002',
    booking: process.env.BOOKING_SERVICE_URL ?? 'http://localhost:3003',
    payment: process.env.PAYMENT_SERVICE_URL ?? 'http://localhost:3004',
    ticket: process.env.TICKET_SERVICE_URL ?? 'http://localhost:3005',
    catalog: process.env.CATALOG_SERVICE_URL ?? 'http://localhost:3006',
    weather: process.env.WEATHER_SERVICE_URL ?? 'http://localhost:3007',
    quota: process.env.QUOTA_SERVICE_URL ?? 'http://localhost:3008',
    admin: process.env.ADMIN_SERVICE_URL ?? 'http://localhost:3009',
  };

  constructor(private readonly httpService: HttpService) {}

  private getServiceUrl(path: string): { url: string; service: string } {
    if (path.startsWith('/api/auth')) {
      return { url: this.serviceUrls.auth, service: 'auth' };
    }
    if (path.startsWith('/api/bookings')) {
      return { url: this.serviceUrls.booking, service: 'booking' };
    }
    if (path.startsWith('/api/payments')) {
      return { url: this.serviceUrls.payment, service: 'payment' };
    }
    if (path.startsWith('/api/tickets')) {
      return { url: this.serviceUrls.ticket, service: 'ticket' };
    }
    if (
      path.startsWith('/api/mountains') ||
      path.startsWith('/api/routes') ||
      path.startsWith('/api/basecamp') ||
      path.startsWith('/api/sessions') ||
      path.startsWith('/api/seed')
    ) {
      return { url: this.serviceUrls.catalog, service: 'catalog' };
    }
    if (
      path.startsWith('/api/announcements') ||
      path.startsWith('/api/news') ||
      path.startsWith('/api/rules')
    ) {
      return { url: this.serviceUrls.admin, service: 'admin' };
    }
    if (path.startsWith('/api/weather')) {
      return { url: this.serviceUrls.weather, service: 'weather' };
    }
    if (path.startsWith('/api/quotas')) {
      return { url: this.serviceUrls.quota, service: 'quota' };
    }
    if (path.startsWith('/api/admin')) {
      return { url: this.serviceUrls.admin, service: 'admin' };
    }

    return { url: this.serviceUrls.auth, service: 'default' };
  }

  async forwardRequest(
    method: string,
    path: string,
    body?: any,
    headers?: any,
  ): Promise<any> {
    const { url, service } = this.getServiceUrl(path);
    const targetUrl = `${url}${path}`;

    try {
      let response;
      const commonHeaders = {
        ...headers,
        'X-Forwarded-For': 'api-gateway',
      };

      switch (method.toUpperCase()) {
        case 'GET':
          response = await firstValueFrom(
            this.httpService.get(targetUrl, { headers: commonHeaders }),
          );
          break;
        case 'POST':
          response = await firstValueFrom(
            this.httpService.post(targetUrl, body, { headers: commonHeaders }),
          );
          break;
        case 'PUT':
          response = await firstValueFrom(
            this.httpService.put(targetUrl, body, { headers: commonHeaders }),
          );
          break;
        case 'DELETE':
          response = await firstValueFrom(
            this.httpService.delete(targetUrl, { headers: commonHeaders }),
          );
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      return response.data;
    } catch (error: any) {
      const statusCode = error.response?.status ?? 502;
      const message =
        error.response?.data?.message ?? `Service ${service} unavailable`;

      return {
        error: true,
        statusCode,
        message,
        service,
      };
    }
  }
}
