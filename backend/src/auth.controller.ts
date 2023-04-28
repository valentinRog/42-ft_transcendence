import { Controller, Get, Redirect, Query, Req, Res, Session } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService, Api42Service } from './app.service';
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
		private readonly api42Service: Api42Service
	) {}

	@Get('callback')
	async callback(
			@Query('code') authorizationCode: string,
			@Req() request,
			@Res() response,
			@Session() session,
		) {

		console.log(`Received code: ${authorizationCode}`);
		const accessToken = await this.authService.exchangeToken( authorizationCode, );
		console.log(`Received access token: ${accessToken}`);

		// Store the access token in the session
		session.accessToken = accessToken;

		// Redirect the user to the home page

		session.user = await this.api42Service.getUserInfo(accessToken);

		const userInfo = await this.api42Service.getUserInfo(accessToken);

		console.log(userInfo);
		console.log(userInfo.login);

		response.redirect('/');
	}
}
