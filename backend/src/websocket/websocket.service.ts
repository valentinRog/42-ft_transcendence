import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class WebSocketService {
  private websockets: Map<string, Socket> = new Map();

  addSocket(clientName: string, socket: Socket): void {
    this.websockets.set(clientName, socket);
  }

  removeSocket(clientName: string): void {
    this.websockets.delete(clientName);
  }

  getSocket(clientName: string): Socket | undefined {
    return this.websockets.get(clientName);
  }

  getAllSockets(): Map<string, Socket> {
    return this.websockets;
  }

  getSize(): number {
    return this.websockets.size;
  }

  createRoom(player1: string, player2: string) {
    const room = `${player1}-${player2}`;

    console.log('createRoom', room);

    const socketPlayer1 = this.getSocket(player1);
    const socketPlayer2 = this.getSocket(player2);

    if (!socketPlayer1 || !socketPlayer2) {
      return 'player socket not find';
    }

    socketPlayer1.join(room);
    socketPlayer2.join(room);

    socketPlayer1.emit('enter-room', room);
    socketPlayer2.emit('enter-room', room);

    return room;
  }

  joinRoom(player: string, room: string) {
    console.log('joinRoom', player, room);

    const socketPlayer = this.getSocket(player);

    if (!socketPlayer) {
      return 'player socket not find';
    }

    socketPlayer.join(room);
    socketPlayer.emit('enter-room', room);

    return room;
  }
}
