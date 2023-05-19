import { Injectable } from '@nestjs/common';
import { PongGateway } from './pong.gateway';
import { Socket, Server } from 'socket.io';

@Injectable()
export class PongGatewayFactory {
  createGameGateway(
    player1: Socket,
    player2: Socket,
    server: Server,
  ): PongGateway {
    // Perform any additional setup or configuration for the GameGateway instance
    // You can also inject dependencies or apply any other necessary logic here
    const pongGateway = new PongGateway(player1, player2, server);
    // Additional setup if needed
    return pongGateway;
  }
}
