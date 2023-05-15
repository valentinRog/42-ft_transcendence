import * as IO from "socket.io";

const io = require("socket.io")(4000, {
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
  stateId: number;
  idDelta: number;
  up: boolean;
  down: boolean;
  clientTime: number;
  serverTime: number;
};

let state: GameState = {
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

function update(state: GameState, delta: number): GameState {
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
          dimensions.height - dimensions.paddleHeight - dimensions.paddleOffset;
      }
    }
  });

  return s;
}

let inputs1 = new Array<Input>();
let inputs2 = new Array<Input>();

let player1: IO.Socket | null = null;
let player2: IO.Socket | null = null;

io.on("connection", (socket: IO.Socket) => {
  if (player1 === null) {
    player1 = socket;
    socket.on("input", (input: Input) => {
      inputs1.push(input);
      socket.emit("index", 0);
    });
    socket.on("disconnect", () => {
      player1 = null;
    });
  } else if (player2 === null) {
    player2 = socket;
    socket.on("input", (input: Input) => {
      inputs2.push(input);
      socket.emit("index", 1);
    });
    socket.on("disconnect", () => {
      player2 = null;
    });
  }
  socket.on("ping", (data: number) => {
    socket.emit("ping", [data, Date.now()]);
  });
});

function gameLoop() {
  state = update(state, Date.now() - state.time);
  state.time = Date.now();
  state.id++;
  while (inputs1.length && inputs1[0].serverTime <= Date.now()) {
    const input = inputs1.shift()!;
    state.paddles[0].up = input!.up;
    state.paddles[0].down = input!.down;
  }
  while (inputs2.length && inputs2[0].serverTime <= Date.now()) {
    const input = inputs2.shift()!;
    state.paddles[1].up = input!.up;
    state.paddles[1].down = input!.down;
  }

  io.emit("state", state);
  setTimeout(gameLoop, 1000 / tickRate);
}

gameLoop();
