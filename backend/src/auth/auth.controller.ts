import { Controller, Get, UseGuards, Req, Res, Session} from '@nestjs/common';
import { AuthService} from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { session } from 'passport';

@Controller()
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Get('auth/42login')
	@UseGuards(AuthGuard('42login'))
	async fortyTwoAuth(@Req() req) {
		// this will not be called, since the authentication is handled by Passport
		return;
	}

	@Get('auth/42login/callback')
	@UseGuards(AuthGuard('42login'))
	async fortyTwoAuthCallback(@Req() request, @Res() response, @Session() session) {
		try {
			const user = await this.authService.findOrCreate(request.user);
			console.log(user);
			session.user = user;
			response.redirect('/');
		}
		catch (err) {
			// Handle the error
		}
	}
}
