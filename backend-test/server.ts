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

let ball = {
  x: dimensions.width / 2,
  y: dimensions.height / 2,
  dx: -1,
  dy: 0.2,
  t: Date.now(),
  speed: 250, //pixels per second
};

const paddles = [
  (dimensions.height - dimensions.paddleHeight) / 2,
  (dimensions.height - dimensions.paddleHeight) / 2,
];

function rotate(x: number, y: number, angle: number): { x: number; y: number } {
  return {
    x: x * Math.cos(angle) - y * Math.sin(angle),
    y: x * Math.sin(angle) + y * Math.cos(angle),
  };
}

function update(): void {
  const now = Date.now();
  const dt = (now - ball.t) / 1000;
  ball.t = now;
  ball.x += ball.dx * ball.speed * dt;
  ball.y += ball.dy * ball.speed * dt;

  const maxAngle = Math.PI / 4;
  const wallLeft = dimensions.ballRadius + dimensions.paddleWidth;
  const wallRight =
    dimensions.width - dimensions.ballRadius - dimensions.paddleWidth;
  if (ball.x < wallLeft && ball.dx < 0) {
    if (ball.y < paddles[0] || ball.y > paddles[0] + dimensions.paddleHeight) {
      ball.x = dimensions.width / 2;
      ball.y = dimensions.height / 2;
      ball.dx = 1;
      ball.dy = 0;
      return;
    }
    const offset = Math.abs(ball.x - wallLeft);
    const angle =
      (ball.y - (paddles[0] + dimensions.paddleHeight / 2)) /
      (dimensions.paddleHeight / 2);
    ball.dx = 1;
    ball.dy = 0;
    const { x, y } = rotate(ball.dx, ball.dy, angle * maxAngle);
    ball.x = wallLeft + offset * x;
    ball.y = ball.y + offset * y;
    ball.dx = x;
    ball.dy = y;
  } else if (ball.x > wallRight && ball.dx > 0) {
    if (ball.y < paddles[1] || ball.y > paddles[1] + dimensions.paddleHeight) {
      ball.x = dimensions.width / 2;
      ball.y = dimensions.height / 2;
      ball.dx = -1;
      ball.dy = 0;
      return;
    }
    const offset = Math.abs(ball.x - wallRight);
    const angle =
      (ball.y - (paddles[1] + dimensions.paddleHeight / 2)) /
      (dimensions.paddleHeight / 2);
    ball.dx = -1;
    ball.dy = 0;
    const { x, y } = rotate(ball.dx, ball.dy, angle * maxAngle);
    ball.x = wallRight - offset * x;
    ball.y = ball.y + offset * y;
    ball.dx = x;
    ball.dy = y;
  }

  if (ball.y < dimensions.ballRadius && ball.dy < 0) {
    const offset = Math.abs(ball.y - dimensions.ballRadius);
    ball.y = dimensions.ballRadius + offset;
    ball.dy = -ball.dy;
  } else if (
    ball.y > dimensions.height - dimensions.ballRadius &&
    ball.dy > 0
  ) {
    const offset = Math.abs(
      ball.y - (dimensions.height - dimensions.ballRadius)
    );
    ball.y = dimensions.height - dimensions.ballRadius - offset;
    ball.dy = -ball.dy;
  }
}

let players = new Array<any>();

io.on("connection", (socket: any) => {
  if (players.length < 2) {
    players.push(socket.id);
  }
  console.log(players.length);
  socket.on("disconnect", () => {
    players = players.filter((id: string) => id !== socket.id);
  });
  socket.on("update", (paddleY: number) => {
    paddles[players.indexOf(socket.id)] = paddleY;
    update();
    socket.emit("update", ball);
    socket.emit("index", players.indexOf(socket.id));
    socket.emit("paddle", paddles[Math.abs(players.indexOf(socket.id) - 1)]);
  });
});
