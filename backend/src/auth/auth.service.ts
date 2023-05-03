import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';


@Injectable()
export class AuthService {

	constructor( private prisma: PrismaService) {}

	async findOrCreate(user: any): Promise<any> {
		// implement your logic for finding or creating the user in your database
		// and return the user object with the required fields
		return user;
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
