import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import axios from 'axios';
import * as crypto from 'crypto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AuthService {

	private readonly randomState: string;

	constructor( private prisma: PrismaService) {
		this.randomState = crypto.randomBytes(5).toString('hex');
	}

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

	async getUserInfo(accessToken: string): Promise<any> {
		const response = await axios.get('https://api.intra.42.fr/v2/me',
		{ headers: { Authorization: `Bearer ${accessToken}` }});
		return response.data;
	}

	getRandomState(): string {
		return this.randomState;
	}

	async signin(user: any): Promise<User> {

		const prisma_user = await this.prisma.user.findUnique({ where: { id: user.id } });

		if (!prisma_user) {
			return this.signup(user);
		}
		return prisma_user;
	}

	signup(user: any): Promise<User> {

		const { id, login, email, first_name, last_name } = user;

		try {
			return this.prisma.user.create({ data: {
				id: id,
				createdAt: new Date(),
				updatedAt: new Date(),
				username: login,
				email: email,
				firstName: first_name,
				lastName: last_name,
			  } });
		}
		catch (error) {
			if (error instanceof PrismaClientKnownRequestError) {
				if ( error.code == 'P2002') {
					throw new ForbiddenException('User already exists');
				}
			}
			throw error;
		}
	}
}
