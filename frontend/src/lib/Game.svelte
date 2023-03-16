<script lang="ts">
	import { onMount } from 'svelte';
	import ioClient from 'socket.io-client';

	const serverTickRate = 40;

	let ping = 0;

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
		paddleWidth: 15
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

	let paddleY = dimensions.height / 2;
	let inputs = new Array<[number, number]>();

	let index: 1 | 2 | null = null;

	let gameState: GameState = {
		ball: {
			x: dimensions.width / 2,
			y: dimensions.height / 2,
			dx: 1,
			dy: 0,
			speed: 400
		},
		paddle1Y: paddleY,
		paddle2Y: dimensions.height / 2,
		lastUpdate: Date.now()
	};

	let t0 = 0;
	let acc = 0;
	let fps = 0;
	function draw(ctx: CanvasRenderingContext2D) {
		if (t0 === 0) {
			t0 = Date.now();
		} else if (t0 + 1000 < Date.now()) {
			fps = acc;
			acc = 0;
			t0 = Date.now();
		} else {
			acc++;
		}
		gameState = nextFrame(gameState, Date.now() - gameState.lastUpdate);

		ctx.clearRect(0, 0, dimensions.width, dimensions.height);
		ctx.beginPath();
		ctx.arc(gameState.ball.x, gameState.ball.y, dimensions.ballRadius, 0, Math.PI * 2);
		ctx.fill();
		ctx.closePath();

		if (index === 1) {
			ctx.fillRect(
				0,
				paddleY - dimensions.paddleHeight / 2,
				dimensions.paddleWidth,
				dimensions.paddleHeight
			);
		} else {
			ctx.fillRect(
				0,
				gameState.paddle1Y - dimensions.paddleHeight / 2,
				dimensions.paddleWidth,
				dimensions.paddleHeight
			);
		}
		if (index === 2) {
			ctx.fillRect(
				dimensions.width - dimensions.paddleWidth,
				paddleY - dimensions.paddleHeight / 2,
				dimensions.paddleWidth,
				dimensions.paddleHeight
			);
		} else {
			ctx.fillRect(
				dimensions.width - dimensions.paddleWidth,
				gameState.paddle2Y - dimensions.paddleHeight / 2,
				dimensions.paddleWidth,
				dimensions.paddleHeight
			);
		}

		requestAnimationFrame(() => draw(ctx));
	}

	function handleMouseMove(e: MouseEvent, canvas: HTMLCanvasElement) {
		const relativeY = e.clientY - canvas.offsetTop;
		if (
			relativeY > dimensions.paddleHeight / 2 &&
			relativeY < dimensions.height - dimensions.paddleHeight / 2
		) {
			paddleY = relativeY;
		}
	}

	function nextFrame(state: GameState, delta: number): GameState {
		const s: GameState = JSON.parse(JSON.stringify(state));
		const ball = s.ball;
		ball.x += ball.dx * (delta / 1000) * ball.speed;
		ball.y += ball.dy * (delta / 1000) * ball.speed;
		const wallLeft = dimensions.ballRadius + dimensions.paddleWidth;
		const wallRight = dimensions.width - dimensions.ballRadius - dimensions.paddleWidth;
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

	onMount(() => {
		let url = window.location.origin;
		url = url.substring(0, url.lastIndexOf(':'));
		const socket = ioClient(url + ':3000');
		const canvas = document.querySelector('canvas') as HTMLCanvasElement;
		const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
		canvas.width = dimensions.width;
		canvas.height = dimensions.height;
		draw(ctx);
		document.addEventListener('mousemove', (e) => {
			handleMouseMove(e, canvas);
		});

		setInterval(() => {
			if (index === null) {
				return;
			}
			const data: [number, number] = [Date.now(), paddleY];
			socket.emit('input', data);
			if (inputs.length < 100) {
				inputs.push(data);
			}
		}, 1000 / serverTickRate);
		socket.on('rolleback', (data: [number, GameState]) => {
			let [time, state] = data;
			state.lastUpdate = time;
			inputs.shift();
			for (let i = 0; i < inputs.length; i++) {
				state.paddle1Y = inputs[i][1];
				state = nextFrame(state, inputs[i][0] - state.lastUpdate);
				state.lastUpdate = inputs[i][0];
			}
			gameState = state;
		});

		socket.on('player1', () => {
			index = 1;
		});
		socket.on('player2', () => {
			index = 2;
		});

		setInterval(() => {
			socket.emit('ping', Date.now());
		}, 1000 / 3);

		socket.on('ping', (time: number) => {
			ping = Date.now() - time;
		});
	});
</script>

{#if index === 1}
	<h2>Player 1</h2>
{:else if index === 2}
	<h2>Player 2</h2>
{:else}
	<h2>Spectator</h2>
{/if}

<div>
	<canvas />
</div>
<div>
	<p>ping: {ping}ms</p>
</div>
<div>
	<p>fps: {fps}</p>
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
	}
	h2 {
		text-align: center;
	}
</style>
