import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GatewayService } from './gateway.service';
import { AuthProxyController } from './auth.proxy';
import { BookingsProxyController } from './bookings.proxy';
import { PaymentsProxyController } from './payments.proxy';
import { TicketsProxyController } from './tickets.proxy';
import { CatalogProxyController } from './catalog.proxy';
import { WeatherProxyController } from './weather.proxy';
import { QuotasProxyController } from './quotas.proxy';
import { AdminProxyController } from './admin.proxy';

@Module({
  imports: [HttpModule],
  controllers: [
    AuthProxyController,
    BookingsProxyController,
    PaymentsProxyController,
    TicketsProxyController,
    CatalogProxyController,
    WeatherProxyController,
    QuotasProxyController,
    AdminProxyController,
  ],
  providers: [GatewayService],
})
export class RoutesModule {}
