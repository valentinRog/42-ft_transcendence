import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
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
    namespace: 'pong',
    origin: 'http://localhost:5173',
  },
})
export class PongGateway {
  // extends SocketGateway {
  private games: { [room: string]: PongGame } = {};

  //  @SubscribeMessage('input')
  //  handleInput(@MessageBody() input: Input) {
  //    if (this.player1 !== null && input.clientId === this.player1.id) {
  //      this.inputs1.push(input);
  //      this.player1.emit('index', 0);
  //    } else if (this.player2 !== null && input.clientId === this.player2.id) {
  //      this.inputs2.push(input);
  //      this.player2.emit('index', 1);
  //    }
  //  }

  @SubscribeMessage('ping')
  handlePing(@MessageBody() data: number) {
    return [data, Date.now()];
  }

  @SubscribeMessage('room')
  handleRoom(client: Socket, room: string) {
    console.log('room', room);

    if (!client) {
      console.log('No client');
      return 'No client';
    }

    client.join(room);

    if (!this.games[room]) {
      const game = new PongGame(room);
      this.games[room] = game;
    }

    if (!this.games[room].getPlayer1()) {
      this.games[room].setPlayer1(client);
      client.emit('index', 0);
    } else if (!this.games[room].getPlayer2()) {
      this.games[room].setPlayer2(client);
      client.emit('index', 0);
    }

    //this.server.to(room).emit('room');
  }

  @SubscribeMessage('input')
  handleInput(client: Socket, input: Input) {
    // Iterate through the rooms to find the game room

    if (!client) return;

    const rooms = client.rooms;

    if (!rooms) {
      console.log('No rooms');
      return;
    }

    let gameRoom: string | null = null;
    rooms.forEach((room: string) => {
      if (room !== client.id) {
        // Exclude the default room, which has the same ID as the client
        gameRoom = room;
      }
    });

    if (gameRoom) {
      // Use the game room for further processing
      console.log('Game room:', gameRoom);
      // ...
    }

    const game = this.games[gameRoom];
    if (game) {
      game.handleInput(input);
    }
  }
}
