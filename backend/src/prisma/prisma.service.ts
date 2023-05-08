import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(private readonly configService: ConfigService) {
    super({ datasources: { db: { url: configService.get('DATABASE_URL') } } });
  }

  cleanDb() {
    return this.$transaction([this.stat.deleteMany(), this.user.deleteMany()]);
  }
}
