import { IsNumber, IsString } from 'class-validator';

export class PlayerDto {
  @IsString()
  playerId: number;

  @IsNumber()
  elo: number;
}
