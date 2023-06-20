import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(private readonly configService: ConfigService) {
    super({ datasources: { db: { url: configService.get('DATABASE_URL') } } });
  }

  async onModuleInit() {
    await this.$connect();
    await this.initRoles();
  }

  async initRoles() {
    const roles: any = [
      { name: 'Admin' },
      { name: 'Moderator' },
      { name: 'User' },
    ];

    for (const role of roles) {
      const existingRole = await this.role.findUnique({
        where: { name: role.name },
      });

      if (!existingRole) {
        await this.role.create({ data: role });
      }
    }
  }

  cleanDb() {
    return this.$transaction([this.stat.deleteMany(), this.user.deleteMany()]);
  }
}
