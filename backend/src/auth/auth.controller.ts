import { Controller, Get, UseGuards, Req, Res, Session} from '@nestjs/common';
import { AuthService} from './auth.service';
import { LoginGuard } from './guard';

@UseGuards(LoginGuard)
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Get('42login')
	async fortyTwoAuth(@Req() req) {
		// this will not be called, since the authentication is handled by Passport
		return;
	}

	@Get('42login/callback')
	async fortyTwoAuthCallback(@Req() request, @Res() response, @Session() session) {
		try {
			const user = await this.authService.findOrCreate(request.user);
			session.user = user;
			console.log(request.user);
			response.redirect('/');
		}
		catch (err) {
			// Handle the error
		}
	}
}
