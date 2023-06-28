import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { SocketGateway } from '../websocket/websocket.gateway';
import { PongGame } from './pong.class';

type Input = {
  clientId: string;
  stateId: number;
  idDelta: number;
  up: boolean;
  down: boolean;
  clientTime: number;
  serverTime: number;
};

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
  },
})
export class PongGateway extends SocketGateway {
  private games: Map<string, PongGame> = new Map();

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket, @MessageBody() data: number) {
    client?.emit('ping', [data, Date.now()]);
  }

  gameOver(winner: number, room: string) {
    const game = this.games.get(room);
    this.gameEnd(game);
    this.games.delete(room);
    this.server.to(room).emit('game-over', { winnerId: winner });
    game.getPlayer1().leave(room);
    game.getPlayer2().leave(room);
    this.pongService.removeClientRoom(game.getPlayer1().id);
    this.pongService.removeClientRoom(game.getPlayer2().id);
    this.statService.updateStat(
      this.webSocketService.getClientId(game.getPlayer1()),
      {
        result: Math.abs(winner - 1),
        opponentId: this.webSocketService.getClientId(game.getPlayer2()),
      },
    );
  }

  @SubscribeMessage('enter-room')
  handleRoom(client: Socket) {
    const { room, index } = this.pongService.getClientRoom(client.id);
    client.join(room);
    if (!this.games.has(room)) {
      const game = new PongGame(this.server, room);
      this.games.set(room, game);
      game.setCallback((winner: number) => this.gameOver(winner, room));
      game.startGame();
    }
    if (index === 0) {
      this.games.get(room).setPlayer1(client);
      const p1 = this.webSocketService.getClientId(client);
      this.webSocketService.setStatus(p1, 'in-game');
      this.webSocketService.updateStatusForFriends(p1, 'in-game');
    } else if (index === 1) {
      this.games.get(room).setPlayer2(client);
      const p2 = this.webSocketService.getClientId(client);
      this.webSocketService.setStatus(p2, 'in-game');
      this.webSocketService.updateStatusForFriends(p2, 'in-game');
    }
  }

  @SubscribeMessage('spectate')
  handleSpecate(client: Socket, data: { friendId: number }) {
    if (this.pongService.getClientRoom(client.id) !== undefined) return;
    const friend = this.webSocketService.getSocket(data.friendId);
    const room = this.pongService.getClientRoom(friend.id).room;
    this.pongService.setClientRoom(client.id, room, 2);
    const userId = this.webSocketService.getClientId(client);
    this.webSocketService.setStatus(userId, 'spectate');
    this.webSocketService.updateStatusForFriends(userId, 'spectate');
    const game = this.games.get(room);
    client.emit('enter-room', {
      room,
      players: [
        this.webSocketService.getClientId(game.getPlayer1()),
        this.webSocketService.getClientId(game.getPlayer2()),
      ],
    });
  }

  @SubscribeMessage('input')
  handleInput(client: Socket, input: Input) {
    const room = this.pongService.getClientRoom(client.id)?.room;
    if (room === undefined) return;
    const game = this.games.get(room);
    if (game) game.handleInput(input);
  }

  gameEnd(game: PongGame) {
    const p1 = this.webSocketService.getClientId(game.getPlayer1());
    const p2 = this.webSocketService.getClientId(game.getPlayer2());
    if (p1 && p2) {
      this.webSocketService.setStatus(p1, 'online');
      this.webSocketService.setStatus(p2, 'online');
      this.webSocketService.updateStatusForFriends(p1, 'online');
      this.webSocketService.updateStatusForFriends(p2, 'online');
    } else {
      console.log('players not found');
    }
  }

  async handleDisconnect(client: Socket) {
    super.handleDisconnect(client);
    if (this.pongService.getClientRoom(client.id) === undefined) return;
    const { room, index } = this.pongService.getClientRoom(client.id);
    this.pongService.removeClientRoom(client.id);
    if (index !== 0 && index !== 1) return;
    const game = this.games.get(room);
    if (game === undefined) return;
    this.gameEnd(game);
    this.gameOver(Math.abs(index - 1), room);
  }
}
