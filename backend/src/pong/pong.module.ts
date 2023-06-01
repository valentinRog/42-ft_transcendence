import { Module } from '@nestjs/common';
import { PongGateway } from './pong.gateway';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { AuthService } from '../auth/auth.service';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { ChatModule } from '../chat/chat.module';
import { ChatService } from '../chat/chat.service';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [JwtModule.register({}), HttpModule, UserModule, WebSocketModule, ChatModule],
  providers: [PongGateway, AuthService, UserService,  ChatService],
})
export class PongModule {}
