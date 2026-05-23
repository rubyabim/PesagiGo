import { IsString, MinLength } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  bookingId!: string;

  @IsString()
  @MinLength(2)
  method!: string;
}