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
  room: string;
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
  private rooms: Map<string, string> = new Map(); // map clientid and room

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket, @MessageBody() data: number) {
    client?.emit('ping', [data, Date.now()]);
  }

  @SubscribeMessage('enter-room')
  handleRoom(client: Socket, data: { room: string; index: number }) {
    client.join(data.room);
    if (!this.games.has(data.room)) {
      const game = new PongGame(this.server, data.room);
      this.games.set(data.room, game);
    }
    if (data.index === 0) {
      this.rooms.set(client.id, data.room);
      this.games.get(data.room).setPlayer1(client);
      const p1 = this.webSocketService.getClientName(client);
      this.webSocketService.setStatus(p1, 'in-game');
      client.emit('index', 0);
    } else if (data.index === 1) {
      this.rooms.set(client.id, data.room);
      this.games.get(data.room).setPlayer2(client);
      const p2 = this.webSocketService.getClientName(client);
      this.webSocketService.setStatus(p2, 'in-game');
      client.emit('index', 1);
    }
  }

  @SubscribeMessage('spectate')
  handleSpecate(client: Socket, data: { friend: string }) {
    console.log('spectate', data);
    const friend = this.webSocketService.getSocket(data.friend);
    client.emit('enter-room', { room: this.rooms.get(friend.id), index: 2 });
  }

  @SubscribeMessage('input')
  handleInput(client: Socket, input: Input) {
    if (input.room) {
      const game = this.games.get(input.room);
      if (game) {
        game.handleInput(input);
      }
    }
  }

  gameEnd(game: PongGame) {
    const p1 = this.webSocketService.getClientName(game.getPlayer1());
    const p2 = this.webSocketService.getClientName(game.getPlayer2());
    if (p1 && p2) {
      this.webSocketService.setStatus(p1, 'online');
      this.webSocketService.setStatus(p2, 'online');
    } else {
      console.log('players not found');
    }
  }

  async updateStat(
    game: PongGame,
    client: Socket,
    data: { room: string; index: number },
    result: number,
  ) {
    const winner = await this.userService.getUser(
      this.webSocketService.getClientName(client),
    );
    const opponent = data.index === 0 ? game.getPlayer2() : game.getPlayer1();
    const loser = await this.userService.getUser(
      this.webSocketService.getClientName(opponent),
    );
    await this.statService.updateStat(winner.id, {
      result: result,
      opponentName: loser.username,
    });
  }

  @SubscribeMessage('leave-room')
  async handleLeaveRoom(client: Socket, data: { room: string; index: number }) {
    const game = this.games.get(data.room);
    if (game) {
      if (data.index === 0 || data.index === 1) {
        this.rooms.delete(client.id);
        await this.gameEnd(game);
        this.games.delete(data.room);
        const result = data.index === 0 ? 1 : 0;
        this.server.to(data.room).emit('game-over', result);
        this.updateStat(game, client, data, result);
      }
    }
    client.leave(data.room);
  }
}
