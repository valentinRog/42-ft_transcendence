import { IsNotEmpty, IsNumber, IsBoolean } from 'class-validator';

export class ResponseDto {
  @IsNumber()
  @IsNotEmpty()
  friendId: string;

  @IsBoolean()
  @IsNotEmpty()
  response: boolean;
}
