import { IsInt, IsString, Min } from 'class-validator';

export class ManageQuotaDto {
  @IsString()
  sessionId!: string;

  @IsInt()
  @Min(1)
  quotaTotal!: number;
}
