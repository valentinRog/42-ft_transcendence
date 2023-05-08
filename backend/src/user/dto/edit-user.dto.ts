import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class EditUserDto {
  @IsString()
  @IsOptional()
  login?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsBoolean()
  @IsOptional()
  twoFactorEnabled?: boolean;

  @IsString()
  @IsOptional()
  avatar?: string;
}
