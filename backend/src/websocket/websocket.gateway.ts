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

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
  },
})
export abstract class SocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

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

  //  @SubscribeMessage('ping')
  //  handlePing(@MessageBody() data: number) {
  //    return [data, Date.now()];
  //  }
}
