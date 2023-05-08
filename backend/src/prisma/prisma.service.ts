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

  async update(dto: AuthDto): Promise<User> {
    return this.user.update({
      where: { login: dto.login },
      data: dto,
    });
  }

  async findUser(login: string): Promise<User> {
    return this.user.findUnique({ where: { login: login } });
  }

  cleanDb() {
    return this.$transaction([this.stat.deleteMany(), this.user.deleteMany()]);
  }
}
