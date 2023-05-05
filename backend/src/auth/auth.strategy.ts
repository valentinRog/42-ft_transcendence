import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-42';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, 'login_guard') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get('FORTYTWO_CLIENT_ID'),
      clientSecret: configService.get('FORTYTWO_CLIENT_SECRET'),
      callbackURL: `${configService.get('APP_URL')}/${configService.get('CALLBACK')}`,
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: any) {
    try {
		const { login, image, phone } = profile._json;
		const user = {
			login: login,
			image: image.link,
			phone: phone,
			accesstoken: accessToken
		};
		done(null, user);
	  }
	  catch (err) {
		done(err, false);
	  }
  }
}
