import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class WebSocketService {
  private websockets: Map<number, Socket> = new Map();
  private reverseMap: Map<string, number> = new Map();
  private userStatus: Map<number, string> = new Map();

  private rooms = new Map<string, { room: string; index: number }>();

  addSocket(clientId: number, socket: Socket): void {
    if (this.websockets.has(clientId)) {
      this.removeSocket(clientId);
    }
    this.websockets.set(clientId, socket);
    this.reverseMap.set(socket.id, clientId);
  }

  removeSocket(clientId: number): void {
    const socket = this.websockets.get(clientId);
    if (socket) {
      this.websockets.delete(clientId);
      this.reverseMap.delete(socket.id);
      socket.disconnect();
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

    const socketPlayer1 = this.getSocket(player1Id);
    const socketPlayer2 = this.getSocket(player2Id);
    if (!socketPlayer1 || !socketPlayer2) {
      throw new NotFoundException('user socket not connected');
    }
    this.rooms.set(socketPlayer1.id, { room: room, index: 0 });
    this.rooms.set(socketPlayer2.id, { room: room, index: 1 });
    //socketPlayer1.join(room);
    //socketPlayer2.join(room);
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
