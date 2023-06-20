import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { StatModule } from './stat/stat.module';
import { PongModule } from './pong/pong.module';
import { ChatModule } from './chat/chat.module';
import { MatchmakingModule } from './matchmaking/matchmaking.module';
import { WebSocketModule } from './websocket/websocket.module';
import { NotificationModule } from './notification/notification.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    StatModule,
    WebSocketModule,
    NotificationModule,
    PongModule,
    ChatModule,
    MatchmakingModule,
    NotificationModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
