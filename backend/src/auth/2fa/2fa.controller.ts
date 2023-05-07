import { Controller, Post, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import { PrismaService } from './../../prisma/prisma.service';
import { JwtGuard} from '../guard';
import { GetUser } from '../decorator';
import { User } from '@prisma/client';

@Controller('2fa')
export class TwoFactorController {
	constructor(private readonly prisma : PrismaService) {}

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
			encoding: 'base32'
		});
		const qrCodeUrl = `https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=${encodeURIComponent(otpauthUrl)}`;

		// 4. Send the QR code or setup URL to the user
		console.log(qrCodeUrl);

		// 5. Update the user's account record in the database
		user.twoFactorEnabled = true;
		await this.prisma.user.update({ where: { login: user.login}, data: user });
		return user;
	}

	@Post('test')
	@UseGuards(JwtGuard)
	async test(@GetUser() user: User) {
		return user;
	}
}

