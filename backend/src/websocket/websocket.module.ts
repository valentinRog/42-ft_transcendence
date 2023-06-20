import { Module, forwardRef } from '@nestjs/common';
import { WebSocketService } from './websocket.service';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { UserModule } from 'src/user/user.module';
import { StatModule } from 'src/stat/stat.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  exports: [WebSocketService],
  imports: [
    JwtModule.register({}),
    HttpModule,
    forwardRef(() => UserModule),
    StatModule,
    NotificationModule,
  ],
  providers: [WebSocketService],
})
export class WebSocketModule {}
