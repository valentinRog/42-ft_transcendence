import { Injectable } from '@nestjs/common';
import axios from 'axios';


@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}

@Injectable()
export class AuthService {
  async exchangeToken(authorizationCode: string): Promise<string> {
    const clientId = 'u-s4t2ud-60ebefcb75374b0f7a7aa4c158df08058f4db7e73bd1a7c7feeb8fe041f9ae6d';
    const clientSecret = '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';
	const redirectUri = 'http://localhost:3000/auth/callback';

    const response = await axios.post('https://api.intra.42.fr/oauth/token', {
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      code: authorizationCode,
      redirect_uri: redirectUri,
    });

    return response.data.access_token;
  }
}

@Injectable()
export class Api42Service {
	async getUserInfo(accessToken: string): Promise<any> {
		const response = await axios.get('https://api.intra.42.fr/v2/me',
		  { headers: { Authorization: `Bearer ${accessToken}` } }
		);
		return response.data;
	  }
}
