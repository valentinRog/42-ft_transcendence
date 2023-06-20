import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PrismaClient } from '@prisma/client';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Module({
  imports: [HttpModule],
  controllers: [SettingsController],
  providers: [SettingsService, PrismaClient],
})
export class SettingsModule {}
