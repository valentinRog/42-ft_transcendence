import { Controller, Get, Redirect, Query, Req, Res, Session } from '@nestjs/common';
import { AuthService } from './auth.service';
import * as querystring from 'querystring';

@Controller('auth')
export class AuthController {
	@Get()
	@Redirect(
		'https://api.intra.42.fr/oauth/authorize?' +
		querystring.stringify({
			client_id: 'u-s4t2ud-60ebefcb75374b0f7a7aa4c158df08058f4db7e73bd1a7c7feeb8fe041f9ae6d',
			redirect_uri: 'http://localhost:3000/auth/callback',
			response_type: 'code',
		}),
		301,
	)
	redirectToNest(): void {}

	constructor(
		private readonly authService: AuthService,
	) {}

	@Get('callback')
	async callback(
			@Query('code') authorizationCode: string,
			@Res() response,
			@Session() session,
		) {

		const accessToken = await this.authService.exchangeToken(authorizationCode);

		// Store the access token in the session
		session.accessToken = accessToken;

		// Redirect the user to the home page
		session.user = await this.authService.getUserInfo(accessToken);

		console.log(session.user);
		console.log(session.user.login);

		response.redirect('/');
	}
}
