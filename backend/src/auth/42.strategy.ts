import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-42';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get('FORTYTWO_CLIENT_ID'),
      clientSecret: configService.get('FORTYTWO_CLIENT_SECRET'),
      callbackURL: `${configService.get('APP_URL')}/auth/42/callback`,
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: any) {
    const { id, login, email, first_name, last_name } = profile._json;
    const user = {
      id: +id,
      login,
      email,
      firstName: first_name,
      lastName: last_name,
      accessToken,
      refreshToken,
    };
    done(null, user);
  }
}
