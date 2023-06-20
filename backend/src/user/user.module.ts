import { Module, forwardRef } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { HttpModule } from '@nestjs/axios';
import { PrismaClient } from '@prisma/client';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [HttpModule, forwardRef(() => WebSocketModule)],
  controllers: [UserController],
  providers: [UserService, PrismaClient],
})
export class UserModule {}
