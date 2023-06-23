import { IsNotEmpty, IsString, IsBoolean } from 'class-validator';

export class ResponseDto {
  @IsString()
  @IsNotEmpty()
  friend: string;

  @IsBoolean()
  @IsNotEmpty()
  response: boolean;
}
