import { Injectable } from '@nestjs/common';
import { PlayerDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { WebSocketService } from 'src/websocket/websocket.service';

class MatchmakingQueue {
  private queue: PlayerDto[] = [];

  public enqueue(player: PlayerDto): void {
    this.queue.push(player);
  }

  public dequeue_player(player: PlayerDto): PlayerDto | undefined {
    const index = this.queue.findIndex((p) => p.playerId === player.playerId);
    if (index !== -1) {
      return this.queue.splice(index, 1)[0];
    }
    return undefined;
  }

  public dequeue_last(): PlayerDto | undefined {
    return this.queue.shift();
  }

  public getSize(): number {
    return this.queue.length;
  }

  public isEmpty(): boolean {
    return this.queue.length === 0;
  }

  public isPlayerInQueue(player: PlayerDto): boolean {
    const index = this.queue.findIndex((p) => p.playerId === player.playerId);
    return index !== -1;
  }
}

@Injectable()
export class MatchmakingService {
  private queue: MatchmakingQueue;

  constructor(
    private readonly prisma: PrismaService,
    private readonly socketService: WebSocketService,
  ) {
    this.queue = new MatchmakingQueue();
  }

  async handlePlayerJoinedQueue(player: PlayerDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: player.playerId },
    });
    if (this.socketService.getStatus(user.id) !== 'online') {
      return 'User is not ready';
    }
    this.socketService.setStatus(player.playerId, 'queue');

    if (this.queue.isPlayerInQueue(player)) {
      console.log('Player already in queue');
    }
    this.queue.enqueue(player);
    console.log(this.queue);

    if (this.queue.getSize() >= 2) {
      const players = [this.queue.dequeue_last(), this.queue.dequeue_last()];
      return await this.handleMatchFound(players);
    }
    return { response: 'Player added to queue' };
  }

  handlePlayerLeftQueue(player: PlayerDto) {
    const queue = this.queue.dequeue_player(player);
    console.log(this.queue);
    return queue;
  }

  handleMatchFound(players: PlayerDto[]) {
    return this.socketService.createRoom(
      players[0].playerId,
      players[1].playerId,
    );
  }

  async joinSpectate(userId: number, room: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (this.socketService.getStatus(user.id) !== 'online') {
      console.log('User is not ready');
    }
    this.socketService.setStatus(user.id, 'spectate');

    // return this.socketService.joinRoom(userId, room);
    return "doesn't work yet";
  }

  async createMatch(userId: number, opponentId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (this.socketService.getStatus(user.id) !== 'online') {
      console.log('User is not ready');
    }
    const friend = await this.prisma.user.findUnique({
      where: { id: opponentId },
    });
    if (this.socketService.getStatus(friend.id) !== 'online') {
      console.log('Friend is not ready');
    }

    console.log('createMatch', userId, opponentId);
    return this.socketService.createRoom(userId, opponentId);
  }
}
