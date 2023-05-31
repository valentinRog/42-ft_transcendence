import { Controller, Post, UseGuards } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import { PrismaService } from './../../prisma/prisma.service';
import { JwtGuard } from '../guard';
import { GetUser } from '../decorator';
import { User } from '@prisma/client';

@Controller('2fa')
export class TwoFactorController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('enable')
  @UseGuards(JwtGuard)
  async enableTwoFactorAuth(@GetUser() user: User) {
    const secret = speakeasy.generateSecret();

    const otpauthUrl = speakeasy.otpauthURL({
      secret: secret.base32,
      label: 'transcendence',
      encoding: 'base32',
    });
    const qrCodeUrl = `https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=${encodeURIComponent(
      otpauthUrl,
    )}`;

    await this.prisma.user.update({
      where: { login: user.login },
      data: { twoFactorEnabled: true, twoFactorAuthSecret: secret.base32 },
    });
    return { qrcode: qrCodeUrl };
  }

  @Post('test')
  @UseGuards(JwtGuard)
  async test(@GetUser() user: User) {
    return user;
  }
}
