import { Controller, Get, Req, Session } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

  	@Get()
  	getHello(@Req() request, @Session() session): string {
	const user = session.user;
		if (user) {
			return user;
		}
		else {
			return "no user";
		}
	}
}
