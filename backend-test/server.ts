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
  width: 800,
  height: 600,
  ballRadius: 10,
  paddleHeight: 120,
  paddleWidth: 15,
};

interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
  speed: number;
}

interface GameState {
  ball: Ball;
  paddleY: number;
}

let gameState: GameState = {
  ball: {
    x: dimensions.width / 2,
    y: dimensions.height / 2,
    dx: 1,
    dy: 0,
    speed: 5,
  },
  paddleY: dimensions.height / 2,
};

function rotate(x: number, y: number, angle: number): { x: number; y: number } {
  return {
    x: x * Math.cos(angle) - y * Math.sin(angle),
    y: x * Math.sin(angle) + y * Math.cos(angle),
  };
}

function nextFrame(state: GameState): GameState {
  const s: GameState = { ...state };
  const ball = s.ball;
  ball.x += ball.dx * ball.speed;
  ball.y += ball.dy * ball.speed;

  if (ball.y - dimensions.ballRadius <= 0 && ball.dy < 0) {
    ball.dy = -ball.dy;
  } else if (
    ball.y + dimensions.ballRadius >= dimensions.height &&
    ball.dy > 0
  ) {
    ball.dy = -ball.dy;
  } else if (ball.x + dimensions.ballRadius > dimensions.width && ball.dx > 0) {
    ball.dx = -ball.dx;
  }

  if (ball.x - dimensions.ballRadius < dimensions.paddleWidth) {
    if (
      ball.y > s.paddleY - dimensions.paddleHeight / 2 &&
      ball.y < s.paddleY + dimensions.paddleHeight / 2 &&
      ball.dx < 0
    ) {
      ball.dx = 0.65;
      ball.dy = Math.sqrt(1 - ball.dx * ball.dx);
      if (ball.y < s.paddleY) {
        ball.dy = -ball.dy;
      }
    } else if (ball.dx < 0) {
      ball.x = dimensions.width / 2;
      ball.y = dimensions.height / 2;
      ball.dx = 1;
      ball.dy = 0;
    }
  }

  return s;
}

let nUser = 0;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

io.on("connection", (socket: any) => {
  if (nUser > 0) {
    return;
  }
  nUser++;
  socket.on("input", (data: [number, number]) => {
    gameState.paddleY = data[1];
    gameState = nextFrame(gameState);
    //wait 10ms to simulate network latency
    sleep(0).then(() => {
      socket.emit("rolleback", [data[0], gameState]);
    });
  });
  socket.on("disconnect", () => {
    nUser--;
  });
  socket.on("ping", (data: any) => {
    socket.emit("ping", data);
  });
});
