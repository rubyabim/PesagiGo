import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { PaymentsService } from './payments.service';

@Controller('api/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: { userId: string }, @Body() dto: CreatePaymentDto) {
    return this.paymentsService.createPayment(user.userId, dto);
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.paymentsService.getPayment(id);
  }

  @Post('webhook')
  webhook(@Body() dto: PaymentWebhookDto) {
    return this.paymentsService.webhook(dto);
  }
}