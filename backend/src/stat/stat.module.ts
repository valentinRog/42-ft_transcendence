import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PrismaClient } from '@prisma/client';
import { StatController } from './stat.controller';
import { StatService } from './stat.service';

@Module({
  imports: [HttpModule],
  controllers: [StatController],
  providers: [StatService, PrismaClient],
})
export class StatModule {}
