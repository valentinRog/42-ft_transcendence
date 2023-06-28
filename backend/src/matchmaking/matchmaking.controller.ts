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
    return await this.matchmakingService.handlePlayerJoinedQueue(user.id);
  }

  @Post('unqueue')
  async unqueue(@GetUser() user) {
    return this.matchmakingService.handlePlayerLeftQueue(user.id);
  }
}
