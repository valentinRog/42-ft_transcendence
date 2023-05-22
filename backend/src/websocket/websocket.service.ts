import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

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
    return this.reverseMap.get(socket.id);
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

    console.log('socketPlayer1', socketPlayer1);

    console.log(this.getAllSockets());

    const socketPlayer2 = this.getSocket(player2);

    if (!socketPlayer1 || !socketPlayer2) {
      console.log('player socket not find');
      return;
    }

    console.log('socketPlayer1', socketPlayer1.id);
    console.log('socketPlayer2', socketPlayer2.id);

    socketPlayer1.join(room);
    socketPlayer2.join(room);

    socketPlayer1.emit('enter-room', room);
    socketPlayer2.emit('enter-room', room);

    //this.userService.updateUserStatus(players[0].username, 'in-game');
    //this.userService.updateUserStatus(players[1].username, 'in-game');

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
