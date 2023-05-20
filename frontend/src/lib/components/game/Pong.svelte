<script lang="ts">
	export const url = '/pong.png';
	export const name = 'Pong';
	import { onMount } from 'svelte';
	import ioClient from 'socket.io-client';

	let ping = 0;
	let serverDelta = 0;
	const tickRate = 30;
	const delay = 20;

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
		clientTime: number;
		serverTime: number;
		up: boolean;
		down: boolean;
	};

	let state: GameState = {
		ball: {
			x: 0,
			y: 0,
			dx: 0,
			dy: 0,
			speed: 0
		},
		paddles: [
			{
				y: 0,
				up: false,
				down: false
			},
			{
				y: 0,
				up: false,
				down: false
			}
		],
		time: 0,
		id: 0,
		inputed: false,
		lastInputId: 0,
		missed: false
	};

	let index = 0;

	let inputs = new Array<Input>();

	function update(state: GameState, delta: number): GameState {
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

	function draw(ctx: CanvasRenderingContext2D) {
		const s = update(state, Date.now() - state.time);
		ctx.clearRect(0, 0, dimensions.width, dimensions.height);
		ctx.fillStyle = 'white';
		ctx.fillRect(s.ball.x, s.ball.y, dimensions.ballWidth, dimensions.ballWidth);
		ctx.fillRect(
			dimensions.paddleOffset,
			s.paddles[0].y,
			dimensions.paddleWidth,
			dimensions.paddleHeight
		);
		ctx.fillRect(
			dimensions.width - dimensions.paddleWidth - dimensions.paddleOffset,
			s.paddles[1].y,
			dimensions.paddleWidth,
			dimensions.paddleHeight
		);
		requestAnimationFrame(() => draw(ctx));
	}

	let up = false;
	let down = false;

	onMount(() => {
		let url = window.location.origin;
		url = url.substring(0, url.lastIndexOf(':'));

		const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjIsImxvZ2luIjoiYnBlcnJhdWQiLCJ0d29GYWN0b3IiOmZhbHNlLCJpc1R3b0ZhY3RvckF1dGhlbnRpY2F0ZWQiOmZhbHNlLCJpYXQiOjE2ODQ1NDA3NjEsImV4cCI6MTY4NDYyNzE2MX0.sj6psQavac4oJgQzCxh_0RnnKtTIBzBwDH5wxuBi1Qg';
		const socket = ioClient(url + ':3000', {
			query: {
				token: token,
			}
		});

		const canvas = document.querySelector('canvas') as HTMLCanvasElement;
		const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
		canvas.width = dimensions.width;
		canvas.height = dimensions.height;

		window.addEventListener('keydown', (e: KeyboardEvent) => {
			if (e.key === 'ArrowUp') {
				up = true;
			} else if (e.key === 'ArrowDown') {
				down = true;
			}
		});
		window.addEventListener('keyup', (e: KeyboardEvent) => {
			if (e.key === 'ArrowUp') {
				up = false;
			} else if (e.key === 'ArrowDown') {
				down = false;
			}
		});

		socket.on('state', (s: GameState) => {
			if (state.id === 0) {
				state = s;
				state.time -= serverDelta;
				draw(ctx);
				return;
			}
			s.time -= serverDelta;
			while (inputs.length && inputs[0].clientTime < s.time) {
				inputs.shift();
			}
			for (let i = 1; i < inputs.length && inputs[i].clientTime <= Date.now(); i++) {
				s = update(s, inputs[i].clientTime - inputs[i - 1].clientTime);
				s.paddles[index].up = inputs[i].up;
				s.paddles[index].down = inputs[i].down;
				s.time = inputs[i].clientTime;
				s.id = inputs[i].stateId;
			}
			state = s;
		});

		socket.on('index', (i: number) => {
			index = i;
		});

		function gameLoop() {
			const input: Input = {
				clientId: socket.id,
				stateId: state.id + delay,
				clientTime: Date.now() + delay,
				serverTime: Date.now() + delay + serverDelta,
				up,
				down
			};
			socket.emit('input', input);
			inputs.push(input);
			if (inputs.length > 100) {
				inputs.shift();
			}
			setTimeout(gameLoop, 1000 / tickRate);
		}
		gameLoop();

		function pingLoop() {
			socket.emit('ping', Date.now());
			setTimeout(pingLoop, 1000 / 3);
		}
		pingLoop();
		socket.on('ping', (data: [number, number]) => {
			ping = Date.now() - data[0];
			serverDelta = data[1] - Date.now() + ping / 2;
		});
	});
</script>

<div>
	<canvas />
</div>

<style lang="scss">
	div {
		display: flex;
		justify-content: center;
		align-items: center;
		canvas {
			border: 0.15rem solid white;
			background-color: black;
		}
	}
</style>
