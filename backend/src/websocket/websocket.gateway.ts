import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { WebSocketService } from './websocket.service';
import { AuthService } from 'src/auth/auth.service';
import { UnauthorizedException } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
  },
})
export class WebsocketsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
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

    console.log('user', user);
    this.webSocketService.addSocket(user.id, socket);

    //this.webSocketService.addSocket(clientId, socket);
  }

  handleDisconnect(socket: Socket) {
    throw new Error('Method not implemented.');
    //const clientId = socket.id;
    //this.webSocketService.removeSocket(clientId);

    // Additional logic for handling disconnections
  }
}
