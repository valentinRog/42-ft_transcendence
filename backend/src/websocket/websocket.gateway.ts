import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
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
      return;
    }

    console.log('socket.id', socket.id);
    this.webSocketService.addSocket(user.username, socket);
  }

  handleDisconnect(client: Socket) {
    console.log(`user ${client.id} disconnected`);

    // Additional logic for handling disconnections
  }
}
