import { OnModuleInit } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface Dimensions {
  readonly width: number;
  readonly height: number;
  readonly ballWidth: number;
  readonly paddleHeight: number;
  readonly paddleWidth: number;
  readonly paddleOffset: number;
  readonly paddleSpeed: number;
}

const dimensions: Dimensions = {
  width: 750,
  height: 450,
  ballWidth: 15,
  paddleHeight: 90,
  paddleWidth: 10,
  paddleOffset: 10,
  paddleSpeed: 500,
};

interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
  speed: number; //pixel per second
}

class Paddle {
  y: number;
  up: boolean;
  down: boolean;
  constructor() {
    this.y = dimensions.height / 2 - dimensions.paddleHeight / 2;
    this.up = false;
    this.down = false;
  }
}

interface GameState {
  ball: Ball;
  paddles: [Paddle, Paddle];
  time: number;
  id: number;
  inputed: boolean;
  lastInputId: number;
  missed: boolean;
}

type Input = {
  clientId: string;
  stateId: number;
  idDelta: number;
  up: boolean;
  down: boolean;
  clientTime: number;
  serverTime: number;
};

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',

    //origin: '*',
  },
})
export class PongGateway
  implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  tickRate = 30;

  inputs1: Input[] = [];
  inputs2: Input[] = [];

  player1: Socket | null = null;
  player2: Socket | null = null;

  state: GameState = {
    ball: {
      x: dimensions.width / 2 - dimensions.ballWidth / 2,
      y: dimensions.height / 2 - dimensions.ballWidth / 2,
      dx: 1,
      dy: 0,
      speed: 300,
    },
    paddles: [new Paddle(), new Paddle()],
    time: Date.now(),
    id: 0,
    inputed: false,
    lastInputId: 0,
    missed: false,
  };

  onModuleInit() {
    //this.server.on('connection', (socket) => {
    //  console.log(socket.id);
    //  console.log('Connected');
    //});

    this.gameLoop();
  }

  handleConnection(socket: Socket) {
    console.log(socket.id);
    if (this.player1 === null) {
      this.player1 = socket;
      console.log('player1 connected');
    } else if (this.player2 === null) {
      this.player2 = socket;
      console.log('player2 connected');
    }
  }

  handleDisconnect(socket: Socket) {
    console.log('handleDisconnect');
    if (socket === this.player1) {
      this.player1 = null;
      console.log('player1 disconnected');
    } else if (socket === this.player2) {
      this.player2 = null;
      console.log('player1 disconnected');
    }
  }

  @SubscribeMessage('events')
  handleEvent(@MessageBody() data: unknown) {
    const event = 'events';
    return { event, data };
  }

  @SubscribeMessage('input')
  handleInput(@MessageBody() input: Input) {
    if (this.player1 !== null && input.clientId === this.player1.id) {
      this.inputs1.push(input);
      this.player1.emit('index', 0);
    } else if (this.player2 !== null && input.clientId === this.player2.id) {
      this.inputs2.push(input);
      this.player2.emit('index', 1);
    } else console.log('input from unknown player');
  }

  @SubscribeMessage('ping')
  handlePing(@MessageBody() data: number) {
    return [data, Date.now()];
  }

  update(state: GameState, delta: number): GameState {
    const s = structuredClone(state) as GameState;
    const ball = s.ball;

    ball.x += ball.dx * ball.speed * (delta / 1000);
    ball.y += ball.dy * ball.speed * (delta / 1000);

    const wallLeft = dimensions.paddleWidth + dimensions.paddleOffset;
    const wallRight =
      dimensions.width - dimensions.paddleWidth - dimensions.paddleOffset;
    if (ball.x <= wallLeft && ball.dx < 0) {
      if (
        !s.missed &&
        ball.y + dimensions.ballWidth >= s.paddles[0].y &&
        ball.y <= s.paddles[0].y + dimensions.paddleHeight
      ) {
        const dyMax = 0.65;
        const distToCenter =
          ball.y +
          dimensions.ballWidth / 2 -
          s.paddles[0].y -
          dimensions.paddleHeight / 2;
        const dy = dyMax * (distToCenter / (dimensions.paddleHeight / 2));
        ball.dx = Math.sqrt(1 - dy * dy);
        ball.dy = dy;
        ball.x = wallLeft + (wallLeft - ball.x);
      } else if (ball.x + dimensions.ballWidth < 0) {
        ball.x = dimensions.width / 2 - dimensions.ballWidth / 2;
        ball.y = dimensions.height / 2 - dimensions.ballWidth / 2;
        ball.dx = 1;
        ball.dy = 0;
        s.missed = false;
      } else {
        s.missed = true;
      }
    } else if (ball.x + dimensions.ballWidth >= wallRight && ball.dx > 0) {
      if (
        !s.missed &&
        ball.y + dimensions.ballWidth >= s.paddles[1].y &&
        ball.y <= s.paddles[1].y + dimensions.paddleHeight
      ) {
        const dyMax = 0.65;
        const distToCenter =
          ball.y +
          dimensions.ballWidth / 2 -
          s.paddles[1].y -
          dimensions.paddleHeight / 2;
        const dy = dyMax * (distToCenter / (dimensions.paddleHeight / 2));
        ball.dx = -Math.sqrt(1 - dy * dy);
        ball.dy = dy;
        ball.x =
          wallRight -
          dimensions.ballWidth -
          (ball.x + dimensions.ballWidth - wallRight);
      } else if (ball.x > dimensions.width) {
        ball.x = dimensions.width / 2 - dimensions.ballWidth / 2;
        ball.y = dimensions.height / 2 - dimensions.ballWidth / 2;
        ball.dx = -1;
        ball.dy = 0;
        s.missed = false;
      } else {
        s.missed = true;
      }
    }

    if (ball.y <= 0 && ball.dy < 0) {
      ball.y = -ball.y;
      ball.dy *= -1;
    } else if (
      ball.y >= dimensions.height - dimensions.ballWidth &&
      ball.dy > 0
    ) {
      ball.y =
        dimensions.height -
        dimensions.ballWidth -
        (ball.y - dimensions.height + dimensions.ballWidth);
      ball.dy *= -1;
    }

    s.paddles.forEach((paddle) => {
      if (paddle.up) {
        paddle.y -= dimensions.paddleSpeed * (delta / 1000);
        if (paddle.y < dimensions.paddleOffset) {
          paddle.y = dimensions.paddleOffset;
        }
      }
      if (paddle.down) {
        paddle.y += dimensions.paddleSpeed * (delta / 1000);
        if (
          paddle.y >
          dimensions.height - dimensions.paddleHeight - dimensions.paddleOffset
        ) {
          paddle.y =
            dimensions.height -
            dimensions.paddleHeight -
            dimensions.paddleOffset;
        }
      }
    });

    return s;
  }

  gameLoop() {
    this.state = this.update(this.state, Date.now() - this.state.time);
    this.state.time = Date.now();
    this.state.id++;
    while (this.inputs1.length && this.inputs1[0].serverTime <= Date.now()) {
      const input = this.inputs1.shift()!;
      this.state.paddles[0].up = input.up;
      this.state.paddles[0].down = input.down;
    }
    while (this.inputs2.length && this.inputs2[0].serverTime <= Date.now()) {
      const input = this.inputs2.shift()!;
      this.state.paddles[1].up = input.up;
      this.state.paddles[1].down = input.down;
    }

    this.server.emit('state', this.state);
    setTimeout(this.gameLoop.bind(this), 1000 / this.tickRate);
  }
}
