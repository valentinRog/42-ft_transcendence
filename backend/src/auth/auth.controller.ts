import { Controller, Get, Query, Res} from '@nestjs/common';
import { AuthService} from './auth.service';
import * as querystring from 'querystring';

@Controller('auth')
export class AuthController {
	constructor (private readonly authService: AuthService) {}

	@Get('login')
	redirect(@Res() response): void {
		console.log('redirect');
		response.redirect('https://api.intra.42.fr/oauth/authorize?' +
		querystring.stringify({
			client_id: 'u-s4t2ud-60ebefcb75374b0f7a7aa4c158df08058f4db7e73bd1a7c7feeb8fe041f9ae6d',
			redirect_uri: 'http://localhost:3000/auth/callback',
			state : this.authService.getRandomState(),
			response_type: 'code',
		}));
	}

	@Get('callback')
	async callback(
			@Query('code') authorizationCode: string, @Query('state') state: string,
			@Res() response) {

		if (state === undefined) {
			console.log('State is empty');
			response.redirect('/');
			return;
		}
		if (state !== this.authService.getRandomState()) {
			console.log('State DOES NOT MATCH');
			console.log(state);
			console.log(this.authService.getRandomState());
			response.redirect('/');
			return;
		}

		const accessToken = await this.authService.exchangeToken(authorizationCode);
		const userInfo = await this.authService.getUserInfo(accessToken);

		await this.authService.signup(userInfo);

		// Redirect the user to the home page
		response.redirect('/');
	}
}
