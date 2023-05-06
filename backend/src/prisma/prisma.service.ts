import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
	constructor(private readonly configService: ConfigService) {
		super(
			{ datasources : { db : { url : configService.get('DATABASE_URL') } } }
		);
	}

	async createUser(user: any): Promise<User> {
		return await this.user.create({ data: this.convertToPrismaUser(user)});
	}

	async update(user: any): Promise<User> {
		return this.user.update({ where: { login: user.login}, data: this.convertToPrismaUser(user) });
	}

	async findUser(user: any): Promise<User> {
		return this.user.findUnique({ where: { login: user.login } });
	}

	convertToPrismaUser(user: any): User {
		const prismaUser: User = {
			id: user.id,
			hash: user.hash,
			logFrom42: user.logFrom42,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
			login: user.login,
			username: user.username,
			phone: user.phone || null,
			image: user.image || null,
			status: user.status,
			twoFactorEnabled: user.twoFactorEnabled,
			twoFactorAuthSecret : user.twoFactorAuthSecret || null,
			friends: user.friends || [],
		  };
		return prismaUser;
	}
}
