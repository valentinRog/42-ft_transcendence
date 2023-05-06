import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy} from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({ jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),secretOrKey: config.get('JWT_SECRET')});
  }

  async validate(payload: { sub: number; login: string; }) {
    return await this.prisma.user.findUnique({ where: { login: payload.login}});
  }
}
