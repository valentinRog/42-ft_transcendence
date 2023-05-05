import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AuthService {
	constructor( private prisma: PrismaService) {}

	async findOrCreate(user: any): Promise<User> {

		const prisma_user = await this.prisma.findUser(user);

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
			return this.prisma.createUser(user);
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

}
