import { IsOptional, IsString } from 'class-validator';

export class EditSettingsDto {
  @IsString()
  @IsOptional()
  up?: string;

  @IsString()
  @IsOptional()
  down?: string;

  @IsString()
  @IsOptional()
  backgroundColor?: string;

  @IsString()
  @IsOptional()
  objectsColor?: string;

  @IsString()
  @IsOptional()
  textColor?: string;
}
