import { IsNotEmpty, IsBoolean, IsNumber } from 'class-validator';

export class ResponseDto {
  @IsNumber()
  @IsNotEmpty()
  friendId: number;

  @IsBoolean()
  @IsNotEmpty()
  response: boolean;
}
