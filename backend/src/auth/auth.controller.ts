import { Controller, Get, Post, UseGuards, Req, Res, Body, HttpCode, HttpStatus, Session} from '@nestjs/common';
import { AuthService} from './auth.service';
import { LoginGuard } from './guard';
import { AuthDto } from './dto';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@UseGuards(LoginGuard)
	@Get('42login')
	async fortyTwoAuth(@Req() req) {
		// this will not be called, since the authentication is handled by Passport
		return;
	}

	@UseGuards(LoginGuard)
	@Get('42login/callback')
	async fortyTwoAuthCallback(@Req() request, @Res() response, @Session() session) {
		try {
			const user = await this.authService.findOrCreate(request.user);
			session.user = user;
			console.log(request.user);
			const token = await this.authService.signToken(user.id, user.login);
			response.cookie('Authorization', `Bearer ${token.access_token}`, { httpOnly: true });
			response.redirect('/');
		}
		catch (err) {
			// Handle the error
		}
	}

	@Post('signup')
	signup(@Body() dto: AuthDto) {
		return this.authService.signup(dto);
	}

	@HttpCode(HttpStatus.OK)
	@Post('signin')
	signin(@Body() dto: AuthDto) {
	  return this.authService.signin(dto);
	}
}
