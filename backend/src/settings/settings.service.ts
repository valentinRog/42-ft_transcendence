import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { EditSettingsDto } from './dto/edit-settings.dto';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaClient) {}

  async getSettings(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { settings: true },
    });
    return user.settings;
  }

  async editSettings(userId: number, dto: EditSettingsDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { settings: true },
    });
    return this.prisma.settings.update({
      where: { id: user.settings.id },
      data: { ...dto },
    });
  }
}
