import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WebSocketService {
  private websockets: Map<number, Socket> = new Map();
  private reverseMap: Map<string, number> = new Map();
  private userStatus: Map<number, string> = new Map();

  constructor(private readonly prisma: PrismaService) {}

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

  async updateStatusForFriends(userId: number, status: string) {
    const userFriends = (
      await this.prisma.user.findUnique({
        where: { id: userId },
      })
    ).friends;
    userFriends.forEach((friendId: number) => {
      console.log(friendId);
      const friendSocket = this.getSocket(friendId);
      if (friendSocket) {
        friendSocket.emit('updateStatus', { friendId: userId, status });
      }
    });
  }
}
