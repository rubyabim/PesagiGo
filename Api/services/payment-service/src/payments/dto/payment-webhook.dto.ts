import { IsOptional, IsString } from 'class-validator';

export class PaymentWebhookDto {
  @IsString()
  bookingId!: string;

  @IsString()
  status!: string;

  @IsOptional()
  @IsString()
  providerRef?: string;

  @IsOptional()
  @IsString()
  method?: string;
}