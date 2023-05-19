import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class PlayerDto {
  @IsString()
  @IsOptional()
  login?: string;
}
