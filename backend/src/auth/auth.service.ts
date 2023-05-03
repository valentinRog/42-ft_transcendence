import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AuthService {
	constructor( private prisma: PrismaService) {}

	async findOrCreate(user: any): Promise<User> {

		const prisma_user = await this.prisma.user.findUnique({ where: { id: user.id } });

		if (!prisma_user) {
			return this.signup(user);
		}
		//else {
		//	return this.update(user);
		//}
		return prisma_user;
	  }

	signup(user: any): Promise<User> {
		try {
			return this.prisma.user.create({ data: {
				id: user.id,
				createdAt: new Date(),
				updatedAt: new Date(),
				username: user.userName,
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				phone: user.phone,
				image: user.image,
			  } });
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

	update(user: any): Promise<User> {
		return this.prisma.user.update({ where: { id: user.id }, data: {
			updatedAt: new Date(),
			phone: user.phone,
		} });
	}
}
