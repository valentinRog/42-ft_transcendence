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
  handleRoom(client: Socket, room: string, index: number) {
    console.log('enter-room', room);
    client.join(room);

    if (!this.games[room]) {
      const game = new PongGame(this.server, room);
      this.games[room] = game;
    }

    if (index === 0 && !this.games[room].getPlayer1()) {
      this.games[room].setPlayer1(client);
      client.emit('index', 0);
    } else if (index === 1 && !this.games[room].getPlayer1()) {
      this.games[room].setPlayer2(client);
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
        console.log('game find');
        game.handleInput(input);
      }
    }
  }
}
