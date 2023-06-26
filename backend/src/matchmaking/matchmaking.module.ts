import { Module } from '@nestjs/common';
import { MatchmakingController } from './matchmaking.controller';
import { MatchmakingService } from './matchmaking.service';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { WebSocketModule } from 'src/websocket/websocket.module';
import { PongModule } from 'src/pong/pong.module';

@Module({
  imports: [JwtModule.register({}), HttpModule, WebSocketModule, PongModule],
  controllers: [MatchmakingController],
  providers: [MatchmakingService],
})
export class MatchmakingModule {}
