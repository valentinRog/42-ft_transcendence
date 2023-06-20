import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

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
}
