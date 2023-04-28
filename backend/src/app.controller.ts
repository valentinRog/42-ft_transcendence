import { Controller, Get, Redirect } from '@nestjs/common';
import { AppService } from './app.service';
import * as querystring from 'querystring';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

}
