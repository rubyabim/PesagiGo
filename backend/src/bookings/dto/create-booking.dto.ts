import { IsInt, IsString, Min } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  sessionId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}