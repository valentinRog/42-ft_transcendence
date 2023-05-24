import { Module, forwardRef } from '@nestjs/common';
import { WebSocketService } from './websocket.service';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { UserModule } from 'src/user/user.module';

@Module({
  exports: [WebSocketService],
  imports: [JwtModule.register({}), HttpModule, forwardRef(() => UserModule)],
  providers: [WebSocketService],
})
export class WebSocketModule {}
