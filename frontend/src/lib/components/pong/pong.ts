interface Dimensions {
	readonly width: number;
	readonly height: number;
	readonly ballWidth: number;
	readonly paddleHeight: number;
	readonly paddleWidth: number;
	readonly paddleOffset: number;
	readonly paddleSpeed: number;
}

export const dimensions: Dimensions = {
	width: 750,
	height: 450,
	ballWidth: 15,
	paddleHeight: 90,
	paddleWidth: 10,
	paddleOffset: 10,
	paddleSpeed: 500
};

interface Ball {
	x: number;
	y: number;
	dx: number;
	dy: number;
	speed: number; //pixel per second
}

type Paddle = {
	y: number;
	up: boolean;
	down: boolean;
};

export interface GameState {
	ball: Ball;
	paddles: [Paddle, Paddle];
	time: number;
	id: number;
	inputed: boolean;
	lastInputId: number;
	missed: boolean;
}

export type Input = {
	stateId: number;
	clientTime: number;
	serverTime: number;
	up: boolean;
	down: boolean;
};

export function update(state: GameState, delta: number): GameState {
	const s = structuredClone(state) as GameState;
	const ball = s.ball;

	ball.x += ball.dx * ball.speed * (delta / 1000);
	ball.y += ball.dy * ball.speed * (delta / 1000);

	const wallLeft = dimensions.paddleWidth + dimensions.paddleOffset;
	const wallRight = dimensions.width - dimensions.paddleWidth - dimensions.paddleOffset;
	if (ball.x <= wallLeft && ball.dx < 0) {
		if (
			!s.missed &&
			ball.y + dimensions.ballWidth >= s.paddles[0].y &&
			ball.y <= s.paddles[0].y + dimensions.paddleHeight
		) {
			const dyMax = 1;
			const distToCenter = ball.y + dimensions.ballWidth / 2 - s.paddles[0].y;
			const dy = dyMax * (distToCenter / dimensions.paddleHeight - 0.5);
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
			const dyMax = 1;
			const distToCenter = ball.y + dimensions.ballWidth / 2 - s.paddles[1].y;
			const dy = dyMax * (distToCenter / dimensions.paddleHeight - 0.5);
			ball.dx = -Math.sqrt(1 - dy * dy);
			ball.dy = dy;
			ball.x = wallRight - dimensions.ballWidth - (ball.x + dimensions.ballWidth - wallRight);
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
	} else if (ball.y >= dimensions.height - dimensions.ballWidth && ball.dy > 0) {
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
			if (paddle.y > dimensions.height - dimensions.paddleHeight - dimensions.paddleOffset) {
				paddle.y = dimensions.height - dimensions.paddleHeight - dimensions.paddleOffset;
			}
		}
	});

	return s;
}
