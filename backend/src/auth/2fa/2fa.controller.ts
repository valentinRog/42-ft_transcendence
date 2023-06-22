import { Controller, Post, UseGuards, Param } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import { PrismaService } from './../../prisma/prisma.service';
import { JwtGuard } from '../guard';
import { GetUser } from '../decorator';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Controller('2fa')
@UseGuards(JwtGuard)
export class TwoFactorController {
  private secret: speakeasy.GeneratedSecret;

  constructor(
    private readonly prisma: PrismaService,
    private config: ConfigService,
    private jwt: JwtService,
    private authService: AuthService,
  ) {}

  @Post('generate')
  async generateTwoFactorUrl() {
    this.secret = speakeasy.generateSecret();

    const otpauthUrl = speakeasy.otpauthURL({
      secret: this.secret.base32,
      label: 'transcendence',
      encoding: 'base32',
    });
    const qrCodeUrl = `https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=${encodeURIComponent(
      otpauthUrl,
    )}`;
    return { qrcode: qrCodeUrl };
  }

  @Post('validate/:code')
  async validateTwoFactor(@GetUser() user: User, @Param('code') code: string) {
    return this.authService.is2faCodeValid(user, code, this.secret.base32);
  }

  @Post('enable')
  async enableTwoFactor(@GetUser() user: User) {
    await this.prisma.user.update({
      where: { login: user.login },
      data: { twoFactorEnabled: true, twoFactorAuthSecret: this.secret.base32 },
    });
    const token = await this.jwt.signAsync(
      {
        sub: user.id,
        login: user.login,
        twoFactor: true,
        isTwoFactorAuthenticated: true,
      },
      {
        expiresIn: '1d',
        secret: this.config.get('JWT_SECRET'),
      },
    );
    return { token: token };
  }
}
