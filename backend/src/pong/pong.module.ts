import { Module } from '@nestjs/common';
import { PongGateway } from './pong.gateway';
import { WebSocketService } from '../websocket/websocket.service';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { AuthService } from '../auth/auth.service';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';

@Module({
  imports: [JwtModule.register({}), HttpModule, UserModule],
  providers: [PongGateway, WebSocketService, AuthService, UserService],
})
export class PongModule {}
