import { IsNotEmpty, IsString, IsIn, IsBoolean } from 'class-validator';

export class NotificationDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['chat', 'game', 'friend'])
  notification: string;
}

export class ResponseDto {
  @IsString()
  @IsNotEmpty()
  friend: string;

  @IsBoolean()
  @IsNotEmpty()
  response: boolean;
}
