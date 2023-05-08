import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { AuthDto } from './../auth/dto';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(private readonly configService: ConfigService) {
    super({ datasources: { db: { url: configService.get('DATABASE_URL') } } });
  }

  async createUser(dto: AuthDto): Promise<User> {
    return await this.user.create({ data: this.convertToPrismaUser(dto) });
  }

  async update(dto: AuthDto): Promise<User> {
    return this.user.update({
      where: { login: dto.login },
      data: this.convertToPrismaUser(dto),
    });
  }

  async findUser(login: string): Promise<User> {
    return this.user.findUnique({ where: { login: login } });
  }

  convertToPrismaUser(dto: any): User {
    const prismaUser: User = {
      id: dto.id,
      hash: dto.hash,
      logFrom42: dto.logFrom42,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
      login: dto.login,
      username: dto.username,
      avatar: dto.avatar || null,
      status: dto.status,
      twoFactorEnabled: dto.twoFactorEnabled,
      twoFactorAuthSecret: dto.twoFactorAuthSecret || null,
      friends: dto.friends || [],
    };
    return prismaUser;
  }

  cleanDb() {
    return this.$transaction([this.stat.deleteMany(), this.user.deleteMany()]);
  }
}
