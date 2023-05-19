import { Module } from '@nestjs/common';
import { WebsocketsGateway } from './websocket.gateway';
import { WebSocketService } from './websocket.service';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { AuthService } from 'src/auth/auth.service';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { PongGatewayFactory } from 'src/pong/pong.gateway.factory';

@Module({
  imports: [JwtModule.register({}), HttpModule, UserModule],
  providers: [WebsocketsGateway, WebSocketService, AuthService, UserService, PongGatewayFactory],
})
export class WebSocketModule {}
