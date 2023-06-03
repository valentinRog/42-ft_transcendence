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
import { ChatService } from 'src/chat/chat.service';
import { StatService } from 'src/stat/stat.service';
import { Chat, ChatUser, Message, User } from '../chat/model/chat.model';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
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
    protected readonly chatService: ChatService,
    protected readonly statService: StatService,
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
    console.log(`${user.username} connected`);
    this.webSocketService.addSocket(user.username, client);
    this.userService.updateUserStatus(user.username, 'online');
  }

  handleDisconnect(client: Socket) {
    const username = this.webSocketService.getClientName(client);
    if (username) this.userService.updateUserStatus(username, 'offline');
    console.log(`${username} disconnected`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, payload: { chatId: number }) {
    client.join(`chat-${payload.chatId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    client: Socket,
    payload: { chatId: number; content: string; friendUsername: string },
  ) {
    let chat = await this.chatService.findChatById(payload.chatId);
    const username = this.webSocketService.getClientName(client);
    const user = await this.userService.getUser(username);

    let otherChatUser = chat ? chat.chatUsers.find(
      (chatUser) => (chatUser as any).user.username !== username,
    ) : null;
    let socket = this.webSocketService.getSocket(
      otherChatUser ? (otherChatUser as any).user.username : payload.friendUsername,
    );

    const sendMessage = async () => {
      const newMessage = await this.chatService.addMessageToDatabase(
        chat.id,
        payload.content,
        user.id,
      );
      if (chat.isGroupChat) {
        this.server.to(`chat-${payload.chatId}`).emit('message', {chatId: chat.id, message: newMessage});
      } else {
        client.emit('message', {chatId: chat.id, message: newMessage});
        if (socket)
          socket.emit('message', {chatId: chat.id, message: newMessage});
      }
    };

    if (!chat) {
      const newchat = await this.chatService.createChat(
        `${username}-${payload.friendUsername}`,
        [username, payload.friendUsername],
        false,
      );
      const newMessage = await this.chatService.addMessageToDatabase(
        newchat.id,
        payload.content,
        user.id,
      );
      newchat.messages.push(newMessage);
      client.emit('addchat', newchat);
      client.emit('updateChat', newchat.id);
      if (socket) {
        socket.emit('addchat', newchat);
        socket.emit('updateChat', newchat.id);
      }
    } else
      await sendMessage();
  }


  @SubscribeMessage('accept-friend')
  async handleAcceptFriend(
    @MessageBody() data: { response: boolean; friend: string },
    @ConnectedSocket() client: Socket,
  ) {
    const username = this.webSocketService.getClientName(client);
    const user = await this.userService.getUser(data.friend);
    if (!user) return { error: 'User not found' };
    if (data.response) {
      this.userService.addFriend(username, user.id);
    }
    client.emit('friend-accepted', data.friend);
  }

  @SubscribeMessage('accept-game')
  async handleMatch(
    @MessageBody() data: { response: boolean; friend: string },
    @ConnectedSocket() client: Socket,
  ) {
    const username = this.webSocketService.getClientName(client);
    const user = await this.userService.getUser(username);
    if (!user) return { error: 'User not found' };
    if (user.status !== 'online') return { error: 'User is not ready' };
    if (data.response) {
      this.webSocketService.createRoom(username, data.friend);
    }
  }
}
