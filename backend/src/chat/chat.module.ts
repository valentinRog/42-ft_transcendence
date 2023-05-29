import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  controllers: [ChatController],
  providers: [ChatService, PrismaClient],
})
export class ChatModule {}
