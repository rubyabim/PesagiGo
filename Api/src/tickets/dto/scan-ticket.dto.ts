import { IsString, MinLength } from 'class-validator';

export class ScanTicketDto {
  @IsString()
  @MinLength(4)
  code!: string;
}