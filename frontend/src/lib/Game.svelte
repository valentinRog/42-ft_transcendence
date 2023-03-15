<script lang="ts">
	import { onMount } from 'svelte';
	import ioClient from 'socket.io-client';

	const tickRate = 30;

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
		speed: number;
	}

	interface GameState {
		ball: Ball;
		paddleY: number;
	}

	let paddleY = dimensions.height / 2;
	let inputs = new Array<[number, number]>();

	let gameState: GameState = {
		ball: {
			x: dimensions.width / 2,
			y: dimensions.height / 2,
			dx: 1,
			dy: 0,
			speed: 5
		},
		paddleY
	};

	function draw(ctx: CanvasRenderingContext2D) {
		ctx.clearRect(0, 0, dimensions.width, dimensions.height);
		ctx.beginPath();
		ctx.arc(gameState.ball.x, gameState.ball.y, dimensions.ballRadius, 0, Math.PI * 2);
		ctx.fill();
		ctx.closePath();
		ctx.fillRect(
			0,
			gameState.paddleY - dimensions.paddleHeight / 2,
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

	function rotate(x: number, y: number, angle: number): { x: number; y: number } {
		return {
			x: x * Math.cos(angle) - y * Math.sin(angle),
			y: x * Math.sin(angle) + y * Math.cos(angle)
		};
	}

	function nextFrame(state: GameState): GameState {
		const s: GameState = { ...state };
		const ball = s.ball;
		ball.x += ball.dx * ball.speed;
		ball.y += ball.dy * ball.speed;

		if (ball.y - dimensions.ballRadius <= 0 && ball.dy < 0) {
			ball.dy = -ball.dy;
		} else if (ball.y + dimensions.ballRadius >= dimensions.height && ball.dy > 0) {
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
			const data: [number, number] = [Date.now(), paddleY];
			socket.emit('input', data);
			inputs.push(data);
		}, 1000 / tickRate);
		socket.on('rolleback', (data: [number, GameState]) => {
			while (inputs[0][0] < data[0]) {
				inputs.shift();
			}
			for (let i = 0; i < inputs.length; i++) {
				data[1].paddleY = inputs[i][1];
				data[1] = nextFrame(data[1]);
			}
			gameState = data[1];
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
