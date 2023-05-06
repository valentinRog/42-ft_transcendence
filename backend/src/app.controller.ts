import { Controller, Get, Req, Session } from '@nestjs/common';
import { AppService } from './app.service';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from './auth/guard';
import { GetUser } from './auth/decorator';
import { User } from '@prisma/client';

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get()
	getHome(@Session() session) {
		if (session.user) {
			return 'Welcome back, ' + session.user.login;
		} else {
			return 'Please log in to continue';
		}
	}

	@UseGuards(JwtGuard)
	@Get('me')
	getMe(@GetUser() user: User) {
		return user;
	}

}
