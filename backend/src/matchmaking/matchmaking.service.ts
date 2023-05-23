import { ForbiddenException, Injectable } from '@nestjs/common';
import { PlayerDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { WebSocketService } from 'src/websocket/websocket.service';

class MatchmakingQueue {
  private queue: PlayerDto[] = [];

  public enqueue(player: PlayerDto): void {
    this.queue.push(player);
  }

  public dequeue_player(player: PlayerDto): PlayerDto | undefined {
    const index = this.queue.findIndex((p) => p.username === player.username);
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
      where: { username: player.username },
    });
    if (user.status !== 'online') {
      return 'User is not ready';
    }
    this.prisma.user.update({
      where: { username: player.username },
      data: { status: 'queue' },
    });

    this.queue.enqueue(player);
    if (this.queue.getSize() >= 2) {
      const players = [this.queue.dequeue_last(), this.queue.dequeue_last()];
      return await this.handleMatchFound(players);
    }

    return { response: 'Player added to queue' };
  }

  handlePlayerLeftQueue(player: PlayerDto) {
    return this.queue.dequeue_player(player);
  }

  handleMatchFound(players: PlayerDto[]) {
    return this.socketService.createRoom(
      players[0].username,
      players[1].username,
    );
  }

  async joinSpectate(userName: string, room: string) {
    const user = await this.prisma.user.findUnique({
      where: { username: userName },
    });
    if (user.status !== 'online') {
      throw new ForbiddenException('User is not ready');
    }
    this.prisma.user.update({
      where: { username: userName },
      data: { status: 'spectate' },
    });

    return this.socketService.joinRoom(userName, room);
  }

  async createMatch(userName: string, opponent: string) {
    const user = await this.prisma.user.findUnique({
      where: { username: userName },
    });
    if (user.status !== 'online') {
      throw new ForbiddenException('User is not ready');
    }
    const friend = await this.prisma.user.findUnique({
      where: { username: opponent },
    });
    if (friend.status !== 'online') {
      throw new ForbiddenException('Friend is not ready');
    }

    return this.socketService.createRoom(userName, opponent);
  }
}
