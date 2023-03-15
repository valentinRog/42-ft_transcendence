<script lang="ts">
	import { onMount } from 'svelte';
	import ioClient from 'socket.io-client';

	const serverTickRate = 40;

	let socket: any;

	let ping = 0;

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
		paddleY: number;
		lastUpdate: number;
	}

	let paddleY = dimensions.height / 2;
	let inputs = new Array<[number, number]>();

	let gameState: GameState = {
		ball: {
			x: dimensions.width / 2,
			y: dimensions.height / 2,
			dx: 1,
			dy: 0,
			speed: 400
		},
		paddleY,
		lastUpdate: Date.now()
	};

	function draw(ctx: CanvasRenderingContext2D) {
		gameState = nextFrame(gameState, Date.now() - gameState.lastUpdate, false);

		ctx.clearRect(0, 0, dimensions.width, dimensions.height);
		ctx.beginPath();
		ctx.arc(gameState.ball.x, gameState.ball.y, dimensions.ballRadius, 0, Math.PI * 2);
		ctx.fill();
		ctx.closePath();

		ctx.fillRect(
			0,
			paddleY - dimensions.paddleHeight / 2,
			dimensions.paddleWidth,
			dimensions.paddleHeight
		);
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

	function nextFrame(state: GameState, delta: number, rolleback = true): GameState {
		const s: GameState = JSON.parse(JSON.stringify(state));
		const ball = s.ball;
		const paddle = rolleback ? s.paddleY : paddleY;
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
				Math.abs(ball.y - paddle) < dimensions.paddleHeight / 2
			) {
				ball.x = wallLeft + Math.abs(ball.x - wallLeft);
				const dyMax = 0.75;
				ball.dy = ((ball.y - paddle) / (dimensions.paddleHeight / 2)) * dyMax;
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

	onMount(() => {
		let url = window.location.origin;
		url = url.substring(0, url.lastIndexOf(':'));
		socket = ioClient(url + ':3000');
		const canvas = document.querySelector('canvas') as HTMLCanvasElement;
		const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
		canvas.width = dimensions.width;
		canvas.height = dimensions.height;
		draw(ctx);
		document.addEventListener('mousemove', (e) => {
			handleMouseMove(e, canvas);
		});

		setInterval(() => {
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
				state.paddleY = inputs[i][1];
				state = nextFrame(state, inputs[i][0] - state.lastUpdate);
				state.lastUpdate = inputs[i][0];
			}
			gameState = state;
		});

		setInterval(() => {
			socket.emit('ping', Date.now());
		}, 1000 / 3);

		socket.on('ping', (time: number) => {
			ping = Date.now() - time;
		});
	});
</script>

<div>
	<canvas />
</div>
<div>
	<p>ping: {ping}ms</p>
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
</style>
