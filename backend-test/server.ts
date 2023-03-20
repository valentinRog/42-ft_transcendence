import * as IO from "socket.io";

const io = require("socket.io")(3000, {
  cors: {
    origin: "*",
  },
});

const tickRate = 100;

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
  paddle: Paddle;
  time: number;
  id: number;
  inputed: boolean;
}

type Input = {
  stateId: number;
  idDelta: number;
  up: boolean;
  down: boolean;
};

let state: GameState = {
  ball: {
    x: dimensions.width / 2 - dimensions.ballWidth / 2,
    y: dimensions.height / 2 - dimensions.ballWidth / 2,
    dx: 1,
    dy: 0,
    speed: 300,
  },
  paddle: new Paddle(),
  time: Date.now(),
  id: 0,
  inputed: false,
};

function update(state: GameState, delta: number): GameState {
  const s = structuredClone(state) as GameState;
  const ball = s.ball;
  const paddle = s.paddle;

  ball.x += ball.dx * ball.speed * (delta / 1000);
  ball.y += ball.dy * ball.speed * (delta / 1000);

  const wallLeft = dimensions.paddleWidth + dimensions.paddleOffset;
  const wallRight =
    dimensions.width - dimensions.paddleWidth - dimensions.paddleOffset;
  if (ball.x <= wallLeft && ball.dx < 0) {
    if (
      ball.y + dimensions.ballWidth >= paddle.y &&
      ball.y <= paddle.y + dimensions.paddleHeight
    ) {
      const dyMax = 1;
      const distToCenter = ball.y + dimensions.ballWidth / 2 - paddle.y;
      const dy = dyMax * (distToCenter / dimensions.paddleHeight - 0.5);
      ball.dx = Math.sqrt(1 - dy * dy);
      ball.dy = dy;
      ball.x = wallLeft + (wallLeft - ball.x);
    } else {
      ball.x = dimensions.width / 2 - dimensions.ballWidth / 2;
      ball.y = dimensions.height / 2 - dimensions.ballWidth / 2;
      ball.dx = 1;
      ball.dy = 0;
    }
  } else if (ball.x >= wallRight && ball.dx > 0) {
    ball.x = wallRight - (ball.x - wallRight);
    ball.dx *= -1;
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

  if (s.paddle.up) {
    paddle.y -= dimensions.paddleSpeed * (delta / 1000);
    if (paddle.y < dimensions.paddleOffset) {
      paddle.y = dimensions.paddleOffset;
    }
  }
  if (s.paddle.down) {
    paddle.y += dimensions.paddleSpeed * (delta / 1000);
    if (
      paddle.y >
      dimensions.height - dimensions.paddleHeight - dimensions.paddleOffset
    ) {
      paddle.y =
        dimensions.height - dimensions.paddleHeight - dimensions.paddleOffset;
    }
  }

  return s;
}

let inputs = new Array<Input>();

let n = 0;
io.on("connection", (socket: IO.Socket) => {
  if (n++ === 0) {
    socket.on("input", (input: Input) => {
      inputs.push(input);
      if (inputs.length > 30) {
        inputs.shift();
      }
    });
  }
  socket.on("ping", (data: number) => {
    socket.emit("ping", [data, Date.now()]);
  });
  socket.on("disconnect", () => {
    n--;
  });
});

function gameLoop(): void {
  state = update(state, Date.now() - state.time);
  state.time = Date.now();
  state.id++;
  while (inputs.length && inputs[0].stateId <= state.id) {
    const input = inputs.shift();
    state.paddle.up = input!.up;
    state.paddle.down = input!.down;
  }
  io.emit("state", state);
  setTimeout(gameLoop, 1000 / tickRate);
}

gameLoop();
