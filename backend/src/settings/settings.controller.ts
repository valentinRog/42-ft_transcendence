import { Controller, Get } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { UseGuards } from '@nestjs/common';

@UseGuards(JwtGuard)
@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}
  @Get('get-settings')
  getSettings(@GetUser('id') userId: number) {
    return this.settingsService.getSettings(userId);
  }
}
