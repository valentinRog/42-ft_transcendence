import { Controller, Get, Req, Redirect } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Req() request): string {
    const user = request.session.user;
    if (user) {
		return user.login;
    }
	else {
		return "no user";
	}
	}
}
