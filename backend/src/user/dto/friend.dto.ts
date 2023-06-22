import { IsNumber, IsNotEmpty } from 'class-validator';

export class FriendDto {
  @IsNumber()
  @IsNotEmpty()
  friendId: number;
}
