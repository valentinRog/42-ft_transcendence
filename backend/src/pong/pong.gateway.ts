import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
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
    origin: 'http://localhost:5173',
  },
})
export class PongGateway extends SocketGateway {
  private games: { [room: string]: PongGame } = {};

  @SubscribeMessage('ping')
  handlePing(@MessageBody() data: number) {
    return [data, Date.now()];
  }

  @SubscribeMessage('enter-room')
  handleRoom(client: Socket, data: { room: string; index: number }) {
    client.join(data.room);

    if (data.index === 0 && !this.games[data.room]) {
      const game = new PongGame(this.server, data.room);
      this.games[data.room] = game;
    }

    if (data.index === 0 && this.games[data.room]) {
      this.games[data.room].setPlayer1(client);
      client.emit('index', 0);
    } else if (data.index === 1 && this.games[data.room]) {
      this.games[data.room].setPlayer2(client);
      client.emit('index', 1);
    }
  }

  @SubscribeMessage('input')
  handleInput(client: Socket, input: Input) {
    let gameRoom: string | null = null;
    client.rooms.forEach((room: string) => {
      if (room !== client.id && !gameRoom) {
        // Exclude the default room, which has the same ID as the client
        gameRoom = room;
      }
    });

    if (gameRoom) {
      const game = this.games[gameRoom];
      if (game) {
        game.handleInput(input);
      }
    }
  }
}
