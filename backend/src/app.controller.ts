import { Controller, Get, Req } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

  	@Get()
  	getHello(@Req() request): string {
		const user = request.session.user;
		if (user) {
			return user.username;
		}
		else {
			return "no user";
		}
	}
}
