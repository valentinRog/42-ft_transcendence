import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from './auth/guard';
import { GetUser } from './auth/decorator';
import { User } from '@prisma/client';

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get()
	getHome() {
		return 'Please Log in';
	}

	@UseGuards(JwtGuard)
	@Get('home')
	getHomeLog(@GetUser() user: User) { // test get only login
		return 'Welcome back, ' + user.login;
	}

	@UseGuards(JwtGuard)
	@Get('me')
	getMe(@GetUser() user: User) {
		return user;
	}

}



