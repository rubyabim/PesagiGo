import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CheckQuotaDto {
  @IsString()
  sessionId!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;
}