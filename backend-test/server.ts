import * as IO from "socket.io";

const io = require("socket.io")(3000, {
  cors: {
    origin: "*",
  },
});

const tickRate = 30;

interface Dimensions {
  readonly width: number;
  readonly height: number;
  readonly ballWidth: number;
  readonly paddleHeight: number;
  readonly paddleWidth: number;
  readonly paddleSpeed: number;
}

const dimensions: Dimensions = {
  width: 750,
  height: 450,
  ballWidth: 15,
  paddleHeight: 90,
  paddleWidth: 10,
  paddleSpeed: 350,
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
    speed: 250,
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
  if (ball.x <= 0 && ball.dx < 0) {
    ball.x = -ball.x;
    ball.dx *= -1;
  } else if (ball.x >= dimensions.width - dimensions.ballWidth && ball.dx > 0) {
    ball.x = 2 * (dimensions.width - dimensions.ballWidth) - ball.x;
    ball.dx *= -1;
  }

  let u = s.paddle.up;
  let d = s.paddle.down;
  s.paddle.up = u;
  s.paddle.down = d;

  if (u) {
    paddle.y -= dimensions.paddleSpeed * (delta / 1000);
    if (paddle.y < 0) {
      paddle.y = 0;
    }
  }
  if (d) {
    paddle.y += dimensions.paddleSpeed * (delta / 1000);
    if (paddle.y > dimensions.height - dimensions.paddleHeight) {
      paddle.y = dimensions.height - dimensions.paddleHeight;
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
    if (input) {
      state.paddle.up = input.up;
      state.paddle.down = input.down;
    }
  }
  io.emit("state", state);
  setTimeout(gameLoop, 1000 / tickRate);
}

gameLoop();
