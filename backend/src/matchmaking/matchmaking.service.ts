import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { PlayerDto } from './dto';

@Injectable()
export class MatchmakingService {
  constructor(private userService: UserService) {}

  async handlePlayerJoinedQueue(player: PlayerDto) {
    // Add player to the matchmaking queue logic
  }

  // Other matchmaking methods...

  async handlePlayerLeftQueue(player: PlayerDto): Promise<void> {
    // Remove player from the matchmaking queue logic
  }

  // Matchmaking logic...

  async handleMatchFound(players: PlayerDto[]): Promise<void> {
    // Handle the matched players logic
  }

  async queue(userId: number) {
    //// update user status to queue
    //const user = this.prisma.user.update({
    //  where: { id: userId },
    //  data: { status: 'queue' },
    //});
    //return user;
  }

  async findOpponent() {
    const waitingUsers = await this.userService.getQueueUsers(); // Retrieve users in "waiting" status

    // Implement matchmaking logic and update user statuses accordingly
    // ...
    console.log(waitingUsers);
  }
}
