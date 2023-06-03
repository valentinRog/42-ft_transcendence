import { IsNotEmpty, IsString, IsIn } from 'class-validator';

export class NotificationDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['chat', 'game', 'friend'])
  notification: string;
}
