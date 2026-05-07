import { IsString, MinLength } from 'class-validator';

export class PayBookingDto {
  @IsString()
  @MinLength(2)
  method!: string;
}