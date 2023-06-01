import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class WebSocketService {
  private websockets: Map<string, Socket> = new Map();
  private reverseMap: Map<string, string> = new Map();

  addSocket(clientName: string, socket: Socket): void {
    this.websockets.set(clientName, socket);
    this.reverseMap.set(socket.id, clientName);
  }

  removeSocket(clientName: string): void {
    const socket = this.websockets.get(clientName);
    if (socket) {
      this.websockets.delete(clientName);
      this.reverseMap.delete(socket.id);
    }
  }

  getSocket(clientName: string): Socket | undefined {
    return this.websockets.get(clientName);
  }

  getClientName(socket: Socket): string | undefined {
    if (socket) return this.reverseMap.get(socket?.id);
    else {
      console.log('socket is undefined');
    }
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
      console.log('user socket not connected');
      throw new NotFoundException('user socket not connected');
    }
    socketPlayer1.join(room);
    socketPlayer2.join(room);
    socketPlayer1.emit('enter-room', { room: room, index: 0 });
    socketPlayer2.emit('enter-room', { room: room, index: 1 });

    return { player1: player1, player2: player2, room: room };
  }

  joinRoom(player: string, room: string) {
    const socketPlayer = this.getSocket(player);

    if (!socketPlayer) {
      throw new NotFoundException('user socket not connected');
    }

    socketPlayer.join(room);
    socketPlayer.emit('enter-room', room);

    return { spectator: player, room: room };
  }

  sendToUser(user_to_notify: string, message: string, event: string) {
    const socket = this.getSocket(user_to_notify);
    socket?.emit(event, { message: message });
  }
}
