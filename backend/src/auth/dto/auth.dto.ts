import {
	IsNotEmpty,
	IsString,
	IsOptional,
  } from 'class-validator';

export class AuthDto {
	@IsString()
	@IsNotEmpty()
	login: string;

	@IsString()
	@IsNotEmpty()
	password: string;

	@IsString()
	@IsNotEmpty()
	username: string;

	@IsString()
	@IsOptional()
	avatar?: string;
}

export class LogDto {
	@IsString()
	@IsNotEmpty()
	login: string;

	@IsString()
	@IsNotEmpty()
	password: string;

	@IsString()
	@IsOptional()
	twoFactor?: string;
}
