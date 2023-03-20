<script lang="ts">
	import { onMount } from 'svelte';
	import ioClient from 'socket.io-client';

	let ping = 0;
	let serverDelta = 0;
	const tickRate = 30;
	const delay = 3;

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
		if (ball.x <= 0 && ball.dx < 0) {
			ball.x = -ball.x;
			ball.dx *= -1;
		} else if (ball.x >= dimensions.width - dimensions.ballWidth && ball.dx > 0) {
			ball.x = 2 * (dimensions.width - dimensions.ballWidth) - ball.x;
			ball.dx *= -1;
		}
		paddle.y -= dimensions.paddleSpeed * (delta / 1000);
		if (paddle.y < 0) {
			paddle.y = 0;
		}
		paddle.y += dimensions.paddleSpeed * (delta / 1000);
		if (paddle.y > dimensions.height - dimensions.paddleHeight) {
			paddle.y = dimensions.height - dimensions.paddleHeight;
		}

		return s;
	}

	function draw(ctx: CanvasRenderingContext2D) {
		let u = state.paddle.up;
		let d = state.paddle.down;
		const s = update(state, Date.now() - state.time);
		ctx.clearRect(0, 0, dimensions.width, dimensions.height);
		ctx.fillRect(s.ball.x, s.ball.y, dimensions.ballWidth, dimensions.ballWidth);
		ctx.fillRect(0, s.paddle.y, dimensions.paddleWidth, dimensions.paddleHeight);
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
					s.paddle.up = inputs[i].up;
					s.paddle.down = inputs[i].down;
					s.id = inputs[i].stateId;
					s = update(s, inputs[i].clientTime - inputs[i - 1].clientTime);
					console.log('rollback');
				}
			}
			s.time = Date.now();
			state = s;
		});

		function gameLoop(): void {
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
	div {
		display: flex;
		justify-content: center;
		align-items: center;
		canvas {
			border: 1px solid black;
			background-color: grey;
			&:hover {
				cursor: none;
			}
		}
		p {
			margin: 2px;
		}
	}
</style>
