import { IsString, IsNumber, IsOptional } from 'class-validator';

export class FriendDto {
  @IsNumber()
  @IsOptional()
  friendId?: number;

  @IsString()
  @IsOptional()
  friend?: string;
}
