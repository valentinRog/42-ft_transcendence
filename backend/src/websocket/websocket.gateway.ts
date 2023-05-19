import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { WebSocketService } from './websocket.service';
import { AuthService } from 'src/auth/auth.service';
import { PongGatewayFactory } from 'src/pong/pong.gateway.factory';
@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
  },
})
export class WebsocketsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly webSocketService: WebSocketService,
    private readonly authService: AuthService,
    private readonly pongGatewayFactory: PongGatewayFactory,
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

    if (this.webSocketService.getSize() == 2) {
      console.log('2 players joined');
      const gameGateway = this.pongGatewayFactory.createGameGateway(
        this.webSocketService.getAllSockets().get(0),
        this.webSocketService.getAllSockets().get(1),
        this.server,
      );
    }
  }

  handleDisconnect(socket: Socket) {
    throw new Error('Method not implemented.');
    //const clientId = socket.id;
    //this.webSocketService.removeSocket(clientId);

    // Additional logic for handling disconnections
  }
}
