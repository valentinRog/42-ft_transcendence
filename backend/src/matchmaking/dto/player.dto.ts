import { IsNumber, IsString } from 'class-validator';

export class PlayerDto {
  @IsString()
  username: string;

  @IsNumber()
  elo: number;
}
