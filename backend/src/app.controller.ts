import { Controller, Get, Req, Session } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get()
	getHome(@Req() req, @Session() session) {
		if (session.user) {

			return 'Welcome back, ' + session.user.login;
		} else {
			return 'Please log in to continue';
		}
	}
}
