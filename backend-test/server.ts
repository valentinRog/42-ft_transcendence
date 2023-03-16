import * as IO from "socket.io";

const io = require("socket.io")(3000, {
  cors: {
    origin: "*",
  },
});

interface Dimensions {
  readonly width: number;
  readonly height: number;
  readonly ballRadius: number;
  readonly paddleHeight: number;
  readonly paddleWidth: number;
}

const dimensions: Dimensions = {
  width: 750,
  height: 450,
  ballRadius: 10,
  paddleHeight: 120,
  paddleWidth: 15,
};

interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
  speed: number; //pixel per second
}

interface GameState {
  ball: Ball;
  paddle1Y: number;
  paddle2Y: number;
  lastUpdate: number;
}

let gameState: GameState = {
  ball: {
    x: dimensions.width / 2,
    y: dimensions.height / 2,
    dx: 1,
    dy: 0,
    speed: 400,
  },
  paddle1Y: dimensions.height / 2,
  paddle2Y: dimensions.height / 2,
  lastUpdate: Date.now(),
};

function nextFrame(state: GameState, delta: number): GameState {
  const s: GameState = JSON.parse(JSON.stringify(state));
  const ball = s.ball;
  ball.x += ball.dx * (delta / 1000) * ball.speed;
  ball.y += ball.dy * (delta / 1000) * ball.speed;
  const wallLeft = dimensions.ballRadius + dimensions.paddleWidth;
  const wallRight =
    dimensions.width - dimensions.ballRadius - dimensions.paddleWidth;
  const wallTop = dimensions.ballRadius;
  const wallBottom = dimensions.height - dimensions.ballRadius;
  if (ball.y >= wallBottom && ball.dy > 0) {
    ball.y = wallBottom - Math.abs(ball.y - wallBottom);
    ball.dy *= -1;
  } else if (ball.y <= wallTop && ball.dy < 0) {
    ball.y = wallTop + Math.abs(ball.y - wallTop);
    ball.dy *= -1;
  } else if (ball.x <= wallLeft && ball.dx < 0) {
    if (
      ball.x > dimensions.paddleWidth &&
      Math.abs(ball.y - s.paddle1Y) < dimensions.paddleHeight / 2
    ) {
      ball.x = wallLeft + Math.abs(ball.x - wallLeft);
      const dyMax = 0.75;
      ball.dy = ((ball.y - s.paddle1Y) / (dimensions.paddleHeight / 2)) * dyMax;
      ball.dx = Math.sqrt(1 - ball.dy * ball.dy);
    } else if (ball.x < 0) {
      ball.x = dimensions.width / 2;
      ball.y = dimensions.height / 2;
      ball.dx = 1;
      ball.dy = 0;
    }
  } else if (ball.x >= wallRight && ball.dx > 0) {
    if (
      ball.x < dimensions.width - dimensions.paddleWidth &&
      Math.abs(ball.y - s.paddle2Y) < dimensions.paddleHeight / 2
    ) {
      ball.x = wallRight - Math.abs(ball.x - wallRight);
      const dyMax = 0.75;
      ball.dy = ((ball.y - s.paddle2Y) / (dimensions.paddleHeight / 2)) * dyMax;
      ball.dx = -Math.sqrt(1 - ball.dy * ball.dy);
    } else if (ball.x > dimensions.width) {
      ball.x = dimensions.width / 2;
      ball.y = dimensions.height / 2;
      ball.dx = -1;
      ball.dy = 0;
    }
  }
  s.lastUpdate = Date.now();
  return s;
}

let player1: IO.Socket | null = null;
let player2: IO.Socket | null = null;
let spectators: Set<IO.Socket> = new Set();

io.on("connection", (socket: IO.Socket) => {
  if (player1 === null) {
    player1 = socket;
  } else if (player2 === null) {
    player2 = socket;
  } else {
    spectators.add(socket);
  }

  socket.on("input", (data: [number, number]) => {
    if (socket === player1) {
      gameState.paddle1Y = data[1];
    } else if (socket === player2) {
      gameState.paddle2Y = data[1];
    }
    gameState = nextFrame(gameState, Date.now() - gameState.lastUpdate);
    socket.emit("rolleback", [data[0], gameState]);
  });

  socket.on("disconnect", () => {
    if (player1 === socket) {
      player1 = null;
    } else if (player2 === socket) {
      player2 = null;
    } else {
      spectators.delete(socket);
    }
  });
  socket.on("ping", (data: any) => {
    socket.emit("ping", data);
  });
});

setInterval(() => {
  if (player1 !== null) {
    player1.emit("player1");
  }
  if (player2 !== null) {
    player2.emit("player2");
  }
}, 1000 / 3);

setInterval(() => {
  spectators.forEach((s) => {
    s.emit("rolleback", [0, gameState]);
  });
}, 1000 / 20);
