import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { WebSocketService } from './websocket.service';
import { AuthService } from 'src/auth/auth.service';
import { PongGame } from 'src/pong/pong.class';

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
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private games: { [room: string]: PongGame } = {};

  constructor(
    private readonly webSocketService: WebSocketService,
    private readonly authService: AuthService,
  ) {}

  async handleConnection(socket: Socket) {
    const token = Array.isArray(socket.handshake.query.token)
      ? socket.handshake.query.token[0]
      : socket.handshake.query.token;

    const user = await this.authService.validateToken(token);

    if (!user) {
      socket.disconnect();
      return false;
    }

    //console.log('user', user);
    console.log('socket.id', socket.id);

    //const pongNamespace = this.server.of('/pong');
    //pongNamespace.on('connection', (pongSocket) => {
    //  // Handle events specific to the "/pong" namespace
    //});

    // You can emit events to the "/pong" namespace
    //pongNamespace.emit('pongEvent', 'Data for pong event');

    this.webSocketService.addSocket(user.id, socket);

    if (this.webSocketService.getSize() == 2) {
      console.log('2 players joined');

      // create room for 2 players
      const room = this.server.to('room1');
      room.emit('room', 'room1');

      this.webSocketService.addSocket(0, socket);
    }
  }

  handleDisconnect(socket: Socket) {
    console.log('user disconnected from websockets');

    // Additional logic for handling disconnections
  }

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

    this.server.to(room).emit('room');
  }

  @SubscribeMessage('input')
  handleInput(client: Socket, @MessageBody() input: Input) {
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
