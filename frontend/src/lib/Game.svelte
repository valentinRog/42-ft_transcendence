<script lang="ts">
	import { onMount } from 'svelte';
	import ioClient from 'socket.io-client';

	let ping = 0;
	let serverDelta = 0;
	const tickRate = 100;
	const delay = 2;

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
		paddleSpeed: 400
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
		paddle: Paddle;
		time: number;
		id: number;
		inputed: boolean;
	}

	type Input = {
		stateId: number;
		idDelta: number;
		clientTime: number;
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
		paddle: {
			y: 0,
			up: false,
			down: false
		},
		time: 0,
		id: 0,
		inputed: false
	};

	let inputs = new Array<Input>();

	function update(state: GameState, delta: number): GameState {
		const s = structuredClone(state) as GameState;
		const ball = s.ball;
		const paddle = s.paddle;

		ball.x += ball.dx * ball.speed * (delta / 1000);
		ball.y += ball.dy * ball.speed * (delta / 1000);

		const wallLeft = dimensions.paddleWidth + dimensions.paddleOffset;
		const wallRight = dimensions.width - dimensions.paddleWidth - dimensions.paddleOffset;
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
		} else if (ball.y >= dimensions.height - dimensions.ballWidth && ball.dy > 0) {
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
			if (paddle.y > dimensions.height - dimensions.paddleHeight - dimensions.paddleOffset) {
				paddle.y = dimensions.height - dimensions.paddleHeight - dimensions.paddleOffset;
			}
		}

		return s;
	}

	function draw(ctx: CanvasRenderingContext2D) {
		let u = state.paddle.up;
		let d = state.paddle.down;
		for (let i = 0; i < inputs.length; i++) {
			if (inputs[i].clientTime >= Date.now()) {
				u = inputs[i].up;
				d = inputs[i].down;
				break;
			}
		}
		state.paddle.up = u;
		state.paddle.down = d;
		const s = update(state, Date.now() - state.time);
		ctx.clearRect(0, 0, dimensions.width, dimensions.height);
		ctx.fillStyle = 'white';
		ctx.fillRect(s.ball.x, s.ball.y, dimensions.ballWidth, dimensions.ballWidth);
		ctx.fillRect(
			dimensions.paddleOffset,
			s.paddle.y,
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
		const socket = ioClient(url + ':3000');
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
				state.time = Date.now();
				draw(ctx);
				return;
			}
			while (inputs.length && inputs[0].stateId < s.id) {
				inputs.shift();
			}
			if (inputs.length) {
				s.paddle.up = inputs[0].up;
				s.paddle.down = inputs[0].down;
				for (let i = 1; i < inputs.length && inputs[i].clientTime <= Date.now(); i++) {
					console.log('rollback');
					s.paddle.up = inputs[i].up;
					s.paddle.down = inputs[i].down;
					s.id = inputs[i].stateId;
					s = update(s, inputs[i].clientTime - inputs[i - 1].clientTime);
				}
			}
			s.time = Date.now();
			state = s;
		});

		function gameLoop() {
			const input: Input = {
				stateId: state.id + delay,
				idDelta: Date.now() - state.time,
				clientTime: Date.now() + delay * tickRate,
				up,
				down
			};
			socket.emit('input', input);
			inputs.push(input);
			if (inputs.length > 30) {
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
		});
	});
</script>

<div>
	<canvas />
</div>
<div>
	<p>ping: {ping}ms</p>
</div>
<div>
	<p>server clock delta: {Math.round(serverDelta)}ms</p>
</div>

<style lang="scss">
	:global(body) {
		background-color: #0d0027;
		color: white;
	}
	div {
		display: flex;
		justify-content: center;
		align-items: center;
		canvas {
			border: 1px solid rgb(255, 255, 255);
			background-color: rgb(0, 0, 0);
			border-radius: 5px;
			&:hover {
				cursor: none;
			}
		}
		p {
			margin: 2px;
		}
	}
</style>
