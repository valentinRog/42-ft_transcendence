import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class WebSocketService {
  private websockets: Map<number, Socket> = new Map();
  private reverseMap: Map<string, number> = new Map();
  private userStatus: Map<number, string> = new Map();

  addSocket(clientId: number, socket: Socket): void {
    this.websockets.set(clientId, socket);
    this.reverseMap.set(socket.id, clientId);
  }

  removeSocket(clientId: number): void {
    const socket = this.websockets.get(clientId);
    if (socket) {
      this.websockets.delete(clientId);
      this.reverseMap.delete(socket.id);
    }
  }

  getSocket(userId: number): Socket | undefined {
    return this.websockets.get(userId);
  }

  getClientId(socket: Socket): number | undefined {
    if (socket) return this.reverseMap.get(socket?.id);
    else {
      console.log('socket is undefined');
    }
  }

  getAllSockets(): Map<number, Socket> {
    return this.websockets;
  }

  getSize(): number {
    return this.websockets.size;
  }

  createRoom(player1Id: number, player2Id: number) {
    const room = uuidv4();
    console.log('createRoom', room);

    const socketPlayer1 = this.getSocket(player1Id);
    const socketPlayer2 = this.getSocket(player2Id);
    if (!socketPlayer1 || !socketPlayer2) {
      throw new NotFoundException('user socket not connected');
    }
    socketPlayer1.join(room);
    socketPlayer2.join(room);
    socketPlayer1.emit('enter-room', { room, index: 0, opponentId: player2Id });
    socketPlayer2.emit('enter-room', { room, index: 1, opponentId: player1Id });

    return { player1: player1Id, player2: player2Id, room };
  }

  joinRoom(playerId: number, room: string) {
    const socketPlayer = this.getSocket(playerId);

    if (!socketPlayer) {
      throw new NotFoundException('user socket not connected');
    }

    socketPlayer.join(room);
    socketPlayer.emit('enter-room', room);

    return { spectator: playerId, room: room };
  }

  sendToUser(userToNotify: number, message: string, event: string) {
    const socket = this.getSocket(userToNotify);
    socket?.emit(event, { message: message });
  }

  setStatus(userId: number, status: string) {
    if (status === 'offline') {
      this.userStatus.delete(userId);
    } else {
      this.userStatus.set(userId, status);
    }
  }

  getStatus(userId: number): string {
    return this.userStatus.get(userId) || 'offline';
  }

  getAllStatus(): Map<number, string> {
    return this.userStatus;
  }
}
