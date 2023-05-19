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
      elo: user.stats.elo,
    };

    return await this.matchmakingService.handlePlayerJoinedQueue(player);
  }
}
