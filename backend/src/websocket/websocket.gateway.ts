import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { WebSocketService } from './websocket.service';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';

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
    protected readonly webSocketService: WebSocketService,
    protected readonly authService: AuthService,
    protected readonly userService: UserService,
  ) {}

  async handleConnection(client: Socket) {
    const token = Array.isArray(client.handshake.query.token)
      ? client.handshake.query.token[0]
      : client.handshake.query.token;

    const user = await this.authService.validateToken(token);

    if (!user) {
      client.disconnect();
      return;
    }
    console.log(`user ${client.id} connected`);
    this.webSocketService.addSocket(user.username, client);
    this.userService.updateUserStatus(user.username, 'online');
  }

  handleDisconnect(client: Socket) {
    console.log(`user ${client.id} disconnected`);
    const username = this.webSocketService.getClientName(client);
    if (username) this.userService.updateUserStatus(username, 'offline');
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() message: { to: string, content: string },
    @ConnectedSocket() client: Socket
  ) {
    const recipientSocket = this.webSocketService.getSocket(message.to);
    if (!recipientSocket) {
      // User is not connected
      return;
    }
    recipientSocket.emit('message', { from: this.webSocketService.getClientName(client), to: message.to, content: message.content });
  }
}
