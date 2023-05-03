import { Controller, Get, UseGuards, Req, Session} from '@nestjs/common';
import { AuthService} from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { FortyTwoStrategy } from './42.strategy';

@Controller()
export class AuthController {
	//constructor (private readonly authService: AuthService) {}
	constructor(private readonly fortyTwoStrategy: FortyTwoStrategy) {}


	@Get('auth/42')
	@UseGuards(AuthGuard('42'))
	async fortyTwoAuth(@Req() req) {
		// this will not be called, since the authentication is handled by Passport
		return;
	}

	@Get('auth/42/callback')
	@UseGuards(AuthGuard('42'))
	async fortyTwoAuthCallback(@Req() req) {
		// the user is now authenticated, handle the redirect or response here
		return req.user;
	}


	//@Get('login')
	//redirect(@Res() response): void {
	//	console.log('redirect');
	//	response.redirect('https://api.intra.42.fr/oauth/authorize?' +
	//	querystring.stringify({
	//		client_id: 'u-s4t2ud-60ebefcb75374b0f7a7aa4c158df08058f4db7e73bd1a7c7feeb8fe041f9ae6d',
	//		redirect_uri: 'http://localhost:3000/auth/callback',
	//		state : this.authService.getRandomState(),
	//		response_type: 'code',
	//	}));
	//}

	//@Get('callback')
	//async callback(
	//		@Query('code') authorizationCode: string, @Query('state') state: string,
	//		@Res() response,
	//		@Session() session,)
	//{

	//	if (state === undefined) {
	//		console.log('State is empty');
	//		response.redirect('/');
	//		return;
	//	}
	//	if (state !== this.authService.getRandomState()) {
	//		console.log('State DOES NOT MATCH');
	//		response.redirect('/');
	//		return;
	//	}

	//	const accessToken = await this.authService.exchangeToken(authorizationCode);
	//	const userInfo = await this.authService.getUserInfo(accessToken);

	//	session.user = await this.authService.signin(userInfo);
	//	console.log(session.user);
	//	// Redirect the user to the home page
	//	response.redirect('/');
	//}
}
