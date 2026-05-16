import { IsNumber, IsString } from 'class-validator';

export class CreateRouteDto {
  @IsString()
  name!: string;

  @IsString()
  location!: string;

  @IsNumber()
  difficulty!: number;

  @IsNumber()
  duration!: number;
}
