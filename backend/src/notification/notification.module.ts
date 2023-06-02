import { Module, forwardRef } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { WebSocketModule } from '../websocket/websocket.module';
import { UserService } from 'src/user/user.service';
import { PrismaClient } from '@prisma/client';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [forwardRef(() => WebSocketModule), HttpModule],
  controllers: [NotificationController],
  providers: [NotificationService, UserService, PrismaClient],
})
export class NotificationModule {}
