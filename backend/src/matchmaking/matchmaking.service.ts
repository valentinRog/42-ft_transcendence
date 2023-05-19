import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PlayerDto } from './dto';
import {
  PlayerJoinedQueueEvent,
  MatchFoundEvent,
  PlayerLeftQueueEvent,
} from './../events/matchmaking.events';

@Injectable()
export class MatchmakingService {
  constructor(
    private userService: UserService,
    private eventEmitter: EventEmitter2,
  ) {}

  async handlePlayerJoinedQueue(player: PlayerDto) {
    // Add player to the matchmaking queue logic

    // Emit PlayerJoinedQueueEvent
    const playerJoinedQueueEvent = new PlayerJoinedQueueEvent(player);
    this.eventEmitter.emit('playerJoinedQueue', playerJoinedQueueEvent);
  }

  // Other matchmaking methods...

  async handlePlayerLeftQueue(player: PlayerDto): Promise<void> {
    // Remove player from the matchmaking queue logic

    // Emit PlayerLeftQueueEvent
    const playerLeftQueueEvent = new PlayerLeftQueueEvent(player);
    this.eventEmitter.emit('playerLeftQueue', playerLeftQueueEvent);
  }

  // Matchmaking logic...

  async handleMatchFound(players: PlayerDto[]): Promise<void> {
    // Handle the matched players logic

    // Emit MatchFoundEvent
    const matchFoundEvent = new MatchFoundEvent(players);
    this.eventEmitter.emit('matchFound', matchFoundEvent);
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
