import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { WebSocketService } from 'src/websocket/websocket.service';

@Injectable()
export class PongService {
  private rooms = new Map<string, { room: string; index: number }>();

  constructor(private readonly socketService: WebSocketService) {}

  isMatched(userId: number) {
    const clientId = this.socketService.getSocket(userId).id;
    return this.rooms.has(clientId);
  }

  getClientRoom(clientId: string) {
    return this.rooms.get(clientId);
  }

  setClientRoom(clientId: string, room: string, index: number) {
    this.rooms.set(clientId, { room: room, index: index });
  }

  removeClientRoom(clientId: string) {
    this.rooms.delete(clientId);
  }

  createRoom(player1Id: number, player2Id: number) {
    const room = uuidv4();
    console.log('createRoom', room);

    const socketPlayer1 = this.socketService.getSocket(player1Id);
    const socketPlayer2 = this.socketService.getSocket(player2Id);
    this.rooms.set(socketPlayer1.id, { room: room, index: 0 });
    this.rooms.set(socketPlayer2.id, { room: room, index: 1 });
    //socketPlayer1.join(room);
    //socketPlayer2.join(room);
    socketPlayer1.emit('enter-room', { room, players: [player1Id, player2Id] });
    socketPlayer2.emit('enter-room', { room, players: [player1Id, player2Id] });

    return { player1: player1Id, player2: player2Id, room };
  }
}
