import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { WebSocketService } from './websocket.service';
import { AuthService } from 'src/auth/auth.service';
import { PongGateway } from 'src/pong/pong.gateway';
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
      const gameGateway = new PongGateway();
      gameGateway.setPlayer1(this.webSocketService.getAllSockets().get(1));
      gameGateway.setPlayer2(this.webSocketService.getAllSockets().get(2));
      gameGateway.setServer(this.server);
      gameGateway.startGame();
      this.webSocketService.addSocket(0, socket);
    }
  }

  handleDisconnect(socket: Socket) {
    console.log('user disconnected');

    // Additional logic for handling disconnections
  }
}
