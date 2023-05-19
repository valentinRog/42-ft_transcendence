import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { PlayerDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';

class MatchmakingQueue {
  private queue: PlayerDto[] = [];

  public enqueue(player: PlayerDto): void {
    this.queue.push(player);
  }

  public dequeue(): PlayerDto | undefined {
    return this.queue.shift();
  }

  public getSize(): number {
    return this.queue.length;
  }

  public isEmpty(): boolean {
    return this.queue.length === 0;
  }

  // Other queue operations as needed...
}

@Injectable()
export class MatchmakingService {
  private queue: MatchmakingQueue;

  constructor(private userService: UserService, private prisma: PrismaService) {
    this.queue = new MatchmakingQueue();
  }

  async handlePlayerJoinedQueue(player: PlayerDto) {
    // Add player to the matchmaking queue logic

    // update user status to queue
    const user = this.prisma.user.update({
      where: { username: player.username },
      data: { status: 'queue' },
    });

    this.queue.enqueue(player);
  }

  // Other matchmaking methods...

  async handlePlayerLeftQueue(player: PlayerDto): Promise<void> {
    // Remove player from the matchmaking queue logic
    this.queue.dequeue();
  }

  // Matchmaking logic...

  async handleMatchFound(players: PlayerDto[]): Promise<void> {
    // Handle the matched players logic
  }
  async findOpponent() {
    const waitingUsers = await this.userService.getQueueUsers(); // Retrieve users in "waiting" status

    // Implement matchmaking logic and update user statuses accordingly
    // ...
    console.log(waitingUsers);
  }
}
