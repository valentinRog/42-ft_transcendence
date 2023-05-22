import { Module } from '@nestjs/common';
import { WebSocketService } from './websocket.service';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { AuthService } from 'src/auth/auth.service';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';

@Module({
  exports: [WebSocketService],
  imports: [JwtModule.register({}), HttpModule, UserModule],
  providers: [WebSocketService, AuthService, UserService],
})
export class WebSocketModule {}
