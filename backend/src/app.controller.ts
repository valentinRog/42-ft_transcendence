import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from './auth/guard';
import { GetUser } from './auth/decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHome() {
    return 'Please Log in';
  }

  @UseGuards(JwtGuard)
  @Get('home')
  getHomeLog(@GetUser('login') login: string) {
    return 'Welcome back, ' + login;
  }
}
