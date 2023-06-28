import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { WebSocketService } from 'src/websocket/websocket.service';
import { PongService } from 'src/pong/pong.service';

class MatchmakingQueue {
  private queue: number[] = [];

  enqueue(playerId: number): void {
    this.queue.push(playerId);
  }

  dequeue_player(player: number): number | undefined {
    const index = this.queue.findIndex((p) => p === player);
    if (index !== -1) {
      return this.queue.splice(index, 1)[0];
    }
    return undefined;
  }

  dequeue_last(): number | undefined {
    return this.queue.shift();
  }

  getSize(): number {
    return this.queue.length;
  }

  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  isPlayerInQueue(player: number): boolean {
    const index = this.queue.findIndex((p) => p === player);
    return index !== -1;
  }
}

@Injectable()
export class MatchmakingService {
  private queue: MatchmakingQueue;

  constructor(
    private readonly prisma: PrismaService,
    private readonly socketService: WebSocketService,
    private readonly pongService: PongService,
  ) {
    this.queue = new MatchmakingQueue();
  }

  async handlePlayerJoinedQueue(playerId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: playerId },
    });
    if (this.socketService.getStatus(user.id) !== 'online') {
      return 'User is not ready';
    }
    if (
      this.pongService.getClientRoom(this.socketService.getSocket(user.id).id)
    ) {
      return 'User is already in a room';
    }
    this.socketService.setStatus(playerId, 'queue');
    this.socketService.updateStatusForFriends(playerId, 'queue');

    if (this.queue.isPlayerInQueue(playerId)) {
      console.log('Player already in queue');
    }
    this.queue.enqueue(playerId);
    console.log(this.queue);

    if (this.queue.getSize() >= 2) {
      const players = [this.queue.dequeue_last(), this.queue.dequeue_last()];
      return this.handleMatchFound(players);
    }
    return { response: 'Player added to queue' };
  }

  handlePlayerLeftQueue(player: number) {
    const queue = this.queue.dequeue_player(player);
    console.log(this.queue);
    return queue;
  }

  handleMatchFound(players: number[]) {
    const [p1, p2] = players;
    if (this.socketService.getStatus(p1) !== 'queue') {
      this.queue.enqueue(p2);
      throw new Error('Player not ready');
    }
    if (this.socketService.getStatus(p2) !== 'queue') {
      this.queue.enqueue(p1);
      throw new Error('Player not ready');
    }
    return this.pongService.createRoom(p1, p2);
  }
}
