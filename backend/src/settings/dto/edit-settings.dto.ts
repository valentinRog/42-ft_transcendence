import { IsOptional, IsString } from 'class-validator';

export class EditSettingsDto {
  @IsString()
  @IsOptional()
  up?: string;

  @IsString()
  @IsOptional()
  down?: string;
}
