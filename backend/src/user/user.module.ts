import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { HttpModule } from '@nestjs/axios';
import { PrismaClient } from '@prisma/client';

@Module({
  imports: [HttpModule],
  controllers: [UserController],
  providers: [UserService, PrismaClient],
})
export class UserModule {}
