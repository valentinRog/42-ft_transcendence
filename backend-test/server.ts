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
  speed: number; //pixel per second
}

interface GameState {
  ball: Ball;
  paddleY: number;
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
  paddleY: dimensions.height / 2,
  lastUpdate: Date.now(),
};

function nextFrame(state: GameState, delta: number): GameState {
  const s: GameState = JSON.parse(JSON.stringify(state));
  const ball = s.ball;
  ball.x += ball.dx * (delta / 1000) * ball.speed;
  ball.y += ball.dy * (delta / 1000) * ball.speed;
  const wallLeft = dimensions.ballRadius + dimensions.paddleWidth;
  const wallRight = dimensions.width - dimensions.ballRadius;
  const wallTop = dimensions.ballRadius;
  const wallBottom = dimensions.height - dimensions.ballRadius;
  if (ball.x >= wallRight && ball.dx > 0) {
    ball.x = wallRight - Math.abs(ball.x - wallRight);
    ball.dx *= -1;
  } else if (ball.y >= wallBottom && ball.dy > 0) {
    ball.y = wallBottom - Math.abs(ball.y - wallBottom);
    ball.dy *= -1;
  } else if (ball.y <= wallTop && ball.dy < 0) {
    ball.y = wallTop + Math.abs(ball.y - wallTop);
    ball.dy *= -1;
  } else if (ball.x <= wallLeft && ball.dx < 0) {
    if (
      ball.x > dimensions.paddleWidth &&
      Math.abs(ball.y - s.paddleY) < dimensions.paddleHeight / 2
    ) {
      ball.x = wallLeft + Math.abs(ball.x - wallLeft);
      const dyMax = 0.75;
      ball.dy = ((ball.y - s.paddleY) / (dimensions.paddleHeight / 2)) * dyMax;
      ball.dx = Math.sqrt(1 - ball.dy * ball.dy);
    } else if (ball.x < 0) {
      ball.x = dimensions.width / 2;
      ball.y = dimensions.height / 2;
      ball.dx = 1;
      ball.dy = 0;
    }
  }
  s.lastUpdate = Date.now();
  return s;
}

let nUser = 0;

io.on("connection", (socket: any) => {
  if (nUser > 0) {
    return;
  }
  nUser++;
  socket.on("input", (data: [number, number]) => {
    gameState.paddleY = data[1];
    gameState = nextFrame(gameState, Date.now() - gameState.lastUpdate);
    socket.emit("rolleback", [data[0], gameState]);
  });

  socket.on("disconnect", () => {
    nUser--;
  });
  socket.on("ping", (data: any) => {
    socket.emit("ping", data);
  });
});
