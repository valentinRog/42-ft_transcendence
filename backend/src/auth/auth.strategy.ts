import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-42';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42login') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get('FORTYTWO_CLIENT_ID'),
      clientSecret: configService.get('FORTYTWO_CLIENT_SECRET'),
      callbackURL: `${configService.get('APP_URL')}/${configService.get('CALLBACK')}`,
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: any) {
    try {
		const { id, login, email, first_name, last_name, image } = profile._json;
		const user = {
			id: id,
			email: email,
			userName: login,
			firstName: first_name,
			lastName: last_name,
			image: image.link,
			accessToken: accessToken
		};
		done(null, user);
	  }
	  catch (err) {
		done(err, false);
	  }
  }
}
