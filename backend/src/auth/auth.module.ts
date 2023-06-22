import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { FortyTwoStrategy } from './auth.strategy';
import { TwoFactorController } from './2fa/2fa.controller';
import { JwtStrategy } from './jwt/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { HttpModule } from '@nestjs/axios';
import { WebSocketService } from '../websocket/websocket.service';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [JwtModule.register({}), HttpModule, UserModule],
  controllers: [AuthController, TwoFactorController],
  providers: [
    AuthService,
    FortyTwoStrategy,
    JwtStrategy,
    UserService,
    WebSocketService,
  ],
})
export class AuthModule {}
