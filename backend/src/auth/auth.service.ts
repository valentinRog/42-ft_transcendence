import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { AuthDto, LogDto } from './dto';
import * as speakeasy from 'speakeasy';
import { UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private jwt: JwtService,
    private userService: UserService,
  ) {}

  async findOrCreate(user: any) {
    const prisma_user = await this.userService.findUser(user.login);

    if (!prisma_user) {
      return this.signup42(user);
    }
    return prisma_user;
  }

  async signup42(dto: AuthDto) {
    try {
      const avatar_path = await this.userService.saveImageFromUrl(
        dto.avatar,
        dto.login,
      );
      return await this.prisma.user.create({
        data: {
          login: dto.login,
          username: dto.username,
          avatar: avatar_path,
          logFrom42: true,
          stat: {
            create: {},
          },
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code == 'P2002') {
          throw new ForbiddenException('user already exists');
        }
      }
      throw error;
    }
  }

  //  stat = await this.prisma.stat.create({
  //	data: {
  //	  user: { connect: { id: user.id } },
  //	}

  //	)};

  async signup(dto: AuthDto) {
    const hash = await argon.hash(dto.password);
    try {
      const user = await this.prisma.user.create({
        data: {
          login: dto.login,
          username: dto.username,
          hash: hash,
          stat: {
            create: {},
          },
        },
        //include: {
        //  stat: true,
        //},
      });
      return this.signToken(user.id, user.login);
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ForbiddenException('credentials taken');
      }
      throw error;
    }
  }

  async signin(dto: LogDto) {
    const prisma_user = await this.userService.findUser(dto.login);
    if (!prisma_user) throw new ForbiddenException('please signup first');
    if (prisma_user.logFrom42)
      throw new ForbiddenException('please login with 42');
    const pwMatches = await argon.verify(prisma_user.hash, dto.password);
    if (!pwMatches) throw new ForbiddenException('credentials incorrect');
    if (prisma_user.twoFactorEnabled)
      return this.is2faCodeValid(prisma_user, dto.twoFactor);
    return this.signToken(prisma_user.id, prisma_user.login);
  }

  async signToken(
    userId: number,
    login: string,
    twoFactor = false,
    isTwoFactorAuthenticated = false,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      login,
      twoFactor,
      isTwoFactorAuthenticated,
    };
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '1d',
      secret: this.config.get('JWT_SECRET'),
    });
    console.log('token', token);
    return { access_token: token };
  }

  async is2faCodeValid(user: User, code: string) {
    const isCodeValid = speakeasy.totp.verify({
      secret: user.twoFactorAuthSecret,
      encoding: 'base32',
      token: code, // the user's 2FA code entered in the frontend
      window: 1, // optional: number of 30-second windows to check before/after the current time
    });
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    return await this.signToken(user.id, user.login, true, true);
  }
}
