import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private config: ConfigService, private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        ExtractJwt.fromUrlQueryParameter('token'),
      ]),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: {
    sub: number;
    login: string;
    isTwoFactorAuthenticated: boolean;
  }) {
    const user = await this.prisma.user.findUnique({
      where: { login: payload.login },
      include: { stat: true },
    });

    if (!user.twoFactorEnabled) {
      delete user.hash;
      return user;
    }
    if (payload.isTwoFactorAuthenticated) {
      delete user.hash;
      return user;
    }
  }
}
