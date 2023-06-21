import { Body, Controller, Get, Patch } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { UseGuards } from '@nestjs/common';
import { EditSettingsDto } from './dto/edit-settings.dto';

@UseGuards(JwtGuard)
@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}
  @Get('get-settings')
  getSettings(@GetUser('id') userId: number) {
    return this.settingsService.getSettings(userId);
  }

  @Patch('edit')
  editSettings(@GetUser('id') userId: number, @Body() dto: EditSettingsDto) {
    console.log(dto);
    return this.settingsService.editSettings(userId, dto);
  }
}
