import { Controller, Post, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';
import { MatchmakingService } from './matchmaking.service';

@UseGuards(JwtGuard)
@Controller('matchmaking')
export class MatchmakingController {
  constructor(private matchmakingService: MatchmakingService) {}

  @Post('queue')
  async queue(@GetUser() user) {
    const player = {
      username: user.username,
      elo: user.stat.elo,
    };
    return await this.matchmakingService.handlePlayerJoinedQueue(player);
  }

  @Post('unqueue')
  async unqueue(@GetUser() user) {
    const player = {
      username: user.username,
      elo: user.stat.elo,
    };

    return this.matchmakingService.handlePlayerLeftQueue(player);
  }

  @Post('spectate')
  async spectate(@GetUser() user, room: string) {
    return await this.matchmakingService.joinSpectate(user.username, room);
  }
}
