import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { PlayerDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { WebSocketService } from 'src/websocket/websocket.service';

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
}

@Injectable()
export class MatchmakingService {
  private queue: MatchmakingQueue;

  constructor(
    private readonly userService: UserService,
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
      const players = [this.queue.dequeue(), this.queue.dequeue()];
      await this.handleMatchFound(players);
    }
  }

  async handlePlayerLeftQueue(player: PlayerDto): Promise<void> {
    this.queue.dequeue();
  }

  async handleMatchFound(players: PlayerDto[]): Promise<string> {
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
      return 'User is not ready';
    }

    this.prisma.user.update({
      where: { username: userName },
      data: { status: 'spectate' },
    });

    return await this.socketService.joinRoom(userName, room);
  }
}
