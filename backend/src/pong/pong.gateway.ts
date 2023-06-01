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
    origin: 'http://localhost:5173',
  },
})
export class PongGateway extends SocketGateway {
  private games: Map<string, PongGame> = new Map();

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket, @MessageBody() data: number) {
    client?.emit('ping', [data, Date.now()]);
    console.log('ping', data);
  }

  @SubscribeMessage('enter-room')
  handleRoom(client: Socket, data: { room: string; index: number }) {
    client.join(data.room);
    if (data.index === 0 && !this.games.get(data.room)) {
      const game = new PongGame(this.server, data.room);
      this.games.set(data.room, game);
    }
    if (data.index === 0 && this.games.get(data.room)) {
      this.games.get(data.room).setPlayer1(client);
      const p1 = this.webSocketService.getClientName(client);
      this.userService.updateUserStatus(p1, 'in-game');
      client.emit('index', 0);
    } else if (data.index === 1 && this.games.get(data.room)) {
      this.games.get(data.room).setPlayer2(client);
      const p2 = this.webSocketService.getClientName(client);
      this.userService.updateUserStatus(p2, 'in-game');
      client.emit('index', 1);
    }
  }

  @SubscribeMessage('input')
  handleInput(client: Socket, input: Input) {
    //let gameRoom: string | null = null;
    //client.rooms.forEach((room: string) => {
    //  if (room !== client.id && !gameRoom) {
    //    // Exclude the default room, which has the same ID as the client
    //    gameRoom = room;
    //  }
    //});

    if (input.room) {
      const game = this.games.get(input.room);
      if (game) {
        game.handleInput(input);
      }
    }
  }

  async gameEnd(game: PongGame) {
    game.stopGame();
    const p1 = this.webSocketService.getClientName(game.getPlayer1());
    const p2 = this.webSocketService.getClientName(game.getPlayer2());
    if (p1 && p2) {
      console.log(await this.userService.updateUserStatus(p1, 'online'));
      console.log(await this.userService.updateUserStatus(p2, 'online'));
    } else {
      console.log('players not found');
    }
  }

  @SubscribeMessage('leave-room')
  async handleLeaveRoom(client: Socket, data: { room: string; index: number }) {
    console.log('leave-room', data);
    client.leave(data.room);
    const game = this.games.get(data.room);
    if (game) {
      if (data.index === 0 || data.index === 1) {
        await this.gameEnd(game);
        this.games.delete(data.room);
        this.server.to(data.room).emit('game-over', data.index ? 0 : 1);
      }
    } else {
      console.log('game not found');
    }
  }
}
