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
    // 1. Generate a 2FA secret key
    const secret = speakeasy.generateSecret();

    // 2. Store the secret key in the user's database record
    user.twoFactorAuthSecret = secret.base32;

    // 3. Generate a QR code or a 2FA setup URL
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
      data: { twoFactorEnabled: true },
    });
    return { qrcode: qrCodeUrl };
  }

  @Post('test')
  @UseGuards(JwtGuard)
  async test(@GetUser() user: User) {
    return user;
  }
}
