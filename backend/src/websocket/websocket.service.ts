import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class WebSocketService {
  private websockets: Map<number, Socket> = new Map();

  addSocket(clientId: number, socket: Socket): void {
    this.websockets.set(clientId, socket);
  }

  removeSocket(clientId: number): void {
    this.websockets.delete(clientId);
  }

  getSocket(clientId: number): Socket | undefined {
    return this.websockets.get(clientId);
  }

  getAllSockets(): Map<number, Socket> {
    return this.websockets;
  }

  getSize(): number {
    return this.websockets.size;
  }
}
