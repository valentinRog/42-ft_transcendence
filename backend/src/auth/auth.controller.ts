import { Controller, Get, Post, UseGuards, Req, Res, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService} from './auth.service';
import { LoginGuard } from './guard';
import { AuthDto, LogDto } from './dto';

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
	async fortyTwoAuthCallback(@Req() request, @Res() response) {
		try {
			const user = await this.authService.findOrCreate(request.user);
			console.log(request.user);
			const token = await this.authService.signToken(user.id, user.login);
			response.redirect('http://localhost:3000/home' + '?token=' + token.access_token);
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
	signin(@Body() dto: LogDto) {
	  return this.authService.signin(dto);
	}
}
