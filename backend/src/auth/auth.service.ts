import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { AuthDto, LogDto } from './dto';

@Injectable()
export class AuthService {
	constructor( private prisma: PrismaService,
				 private config: ConfigService,
				 private jwt: JwtService ) {}

	async findOrCreate(user: any): Promise<User> {

		const prisma_user = await this.prisma.findUser(user.login);

		if (!prisma_user) {
			return this.signup42(user);
		}
		//else {
		//	return this.update(user);
		//}
		return prisma_user;
	  }

	async signup42(dto: AuthDto): Promise<User> {
		try {
			return this.prisma.createUser(dto);
		}
		catch (error) {
			if (error instanceof PrismaClientKnownRequestError) {
				if ( error.code == 'P2002') {
					throw new ForbiddenException('user already exists');
				}
			}
			throw error;
		}
	}

	async signup(dto: AuthDto) {
		// generate the password hash
		const hash = await argon.hash(dto.password);
		try {
		  const user = await this.prisma.user.create({
			data: {
			  login: dto.login,
			  username: dto.username,
			  avatar: dto.avatar,
			  hash : hash,
			},
		  });
		  return this.signToken(user.id, user.login);
		} catch (error) {
		  if ( error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
			  throw new ForbiddenException('credentials taken');
			}
			throw error;
		}
	}

	async signin(dto: LogDto) {
		const user = await this.prisma.user.findUnique({ where: { login: dto.login} });
		if (!user)
			throw new ForbiddenException('credentials incorrect');

		const pwMatches = await argon.verify(user.hash, dto.password);
		if (!pwMatches)
			throw new ForbiddenException('credentials incorrect');
		return this.signToken(user.id, user.login);
	}

	async signToken( userId: number, login: string): Promise<{ access_token: string }> {
		const payload = {
		  sub: userId,
		  login,
		};
		const token = await this.jwt.signAsync(
		  payload,
		  {
			expiresIn: '1d',
			secret: this.config.get('JWT_SECRET'),
		  },
		);
		console.log('token', token);
		return { access_token: token};
	}
}
