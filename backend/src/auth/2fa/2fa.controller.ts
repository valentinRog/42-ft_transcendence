import { Controller, Post, UseGuards, Request } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import { LoginGuard } from './../guard';

@Controller('2fa')
export class TwoFactorController {

	//@Post('enable')
	//@UseGuards(LoginGuard)
	//async enableTwoFactorAuth(@Request() req) {
	//	// 1. Generate a 2FA secret key
	//	const secret = speakeasy.generateSecret();

	//	// 2. Store the secret key in the user's database record
	//	const user = await userService.findById(req.user.id);
	//	user.twoFactorAuthSecret = secret.base32;
	//	await userService.update(user);

	//	// 3. Generate a QR code or a 2FA setup URL
	//	const otpauthUrl = speakeasy.otpauthURL({
	//	secret: secret.base32,
	//	label: 'My App',
	//	encoding: 'base32'
	//	});
	//	const qrCodeUrl = `https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=${encodeURIComponent(otpauthUrl)}`;

	//	// 4. Send the QR code or setup URL to the user
	//	// ... (e.g. via email)

	//	// 5. Update the user's account record in the database
	//	user.isTwoFactorAuthEnabled = true;
	//	await userService.update(user);
	//}

}

