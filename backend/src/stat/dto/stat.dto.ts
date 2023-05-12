import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class UpdateStatDto {
  @IsNumber()
  @IsNotEmpty()
  result: number;

  @IsString()
  @IsNotEmpty()
  opponent: string;
}
