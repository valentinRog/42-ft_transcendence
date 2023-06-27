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

  @SubscribeMessage('enter-room')
  handleRoom(client: Socket) {
    const { room, index } = this.pongService.getClientRoom(client.id);
    client.join(room);
    if (!this.games.has(room)) {
      const game = new PongGame(this.server, room);
      this.games.set(room, game);
      game.setCallback(async (index: number) => {
        this.gameEnd(game);
        this.games.delete(room);
        this.server.to(room).emit('game-over', index);
        game.getPlayer1().leave(room);
        game.getPlayer2().leave(room);
        this.pongService.removeClientRoom(game.getPlayer1().id);
        this.pongService.removeClientRoom(game.getPlayer2().id);
      });
      game.startGame();
    }
    if (index === 0) {
      this.games.get(room).setPlayer1(client);
      const p1 = this.webSocketService.getClientId(client);
      this.webSocketService.setStatus(p1, 'in-game');
      this.updateStatusForFriends(p1, 'in-game');
    } else if (index === 1) {
      this.games.get(room).setPlayer2(client);
      const p2 = this.webSocketService.getClientId(client);
      this.webSocketService.setStatus(p2, 'in-game');
      this.updateStatusForFriends(p2, 'in-game');
    }
  }

  @SubscribeMessage('spectate')
  handleSpecate(client: Socket, data: { friendId: number }) {
    const friend = this.webSocketService.getSocket(data.friendId);
    this.pongService.setClientRoom(
      client.id,
      this.pongService.getClientRoom(friend.id).room,
      2,
    );
    client.emit('enter-room', {
      room: this.pongService.getClientRoom(friend.id).room,
      players: [data.friendId, this.webSocketService.getClientId(client)],
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
      this.updateStatusForFriends(p1, 'online');
      this.updateStatusForFriends(p2, 'online');
      
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
    const winner = await this.userService.getUserById(
      this.webSocketService.getClientId(client),
    );
    const opponent = data.index === 0 ? game.getPlayer2() : game.getPlayer1();
    const loser = await this.userService.getUserById(
      this.webSocketService.getClientId(opponent),
    );
    await this.statService.updateStat(winner.id, {
      result: result,
      opponentName: loser.username,
    });
  }

  @SubscribeMessage('disconnect')
  async handleDisconnect(client: Socket) {
    if (this.pongService.getClientRoom(client.id) === undefined) return;
    const { room, index } = this.pongService.getClientRoom(client.id);
    const game = this.games.get(room);
    if (game) {
      if (index === 0 || index === 1) {
        this.pongService.removeClientRoom(client.id);
        this.gameEnd(game);
        this.games.delete(room);
        const result = index === 0 ? 1 : 0;
        await this.updateStat(game, client, { room, index }, result);
        this.server.to(room).emit('game-over', result);
      }
    }
    client.join(room);
  }
}
