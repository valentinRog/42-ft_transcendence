import {
	IsNotEmpty,
	IsString,
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

	avatar: string;
}

export class LogDto {
	@IsString()
	@IsNotEmpty()
	login: string;

	@IsString()
	@IsNotEmpty()
	password: string;

	@IsString()
	twoFactor: string;
}
