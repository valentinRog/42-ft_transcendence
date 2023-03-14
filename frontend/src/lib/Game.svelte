<script lang="ts">
	import { onMount } from 'svelte';
	import ioClient from 'socket.io-client';

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

	let ball = {
		x: dimensions.width / 2,
		y: dimensions.height / 2,
		dx: -1,
		dy: 0,
		t: Date.now(),
		speed: 250 //pixels per second
	};

	let serverBall = {
		x: dimensions.width / 2,
		y: dimensions.height / 2,
		dx: -1,
		dy: 0,
		t: Date.now(),
		speed: 250 //pixels per second
	};

	const paddles = [
		dimensions.height - dimensions.paddleHeight,
		dimensions.height - dimensions.paddleHeight
	];
	let index: 0 | 1 = 0;

	function draw(ctx: CanvasRenderingContext2D) {
		ctx.clearRect(0, 0, dimensions.width, dimensions.height);

		ctx.beginPath();
		ctx.arc(ball.x, ball.y, dimensions.ballRadius, 0, Math.PI * 2);
		ctx.fill();
		ctx.closePath();

		ctx.fillStyle = 'red';
		ctx.beginPath();
		ctx.arc(serverBall.x, serverBall.y, dimensions.ballRadius, 0, Math.PI * 2);
		ctx.fill();
		ctx.closePath();
		ctx.fillStyle = 'black';

		ctx.rect(0, paddles[0], dimensions.paddleWidth, dimensions.paddleHeight);
		ctx.rect(
			dimensions.width - dimensions.paddleWidth,
			paddles[1],
			dimensions.paddleWidth,
			dimensions.paddleHeight
		);
		ctx.fill();

		requestAnimationFrame(() => {
			update();
			draw(ctx);
		});
	}

	function handleMouseMove(e: MouseEvent, canvas: HTMLCanvasElement) {
		const relativeY = e.clientY - canvas.offsetTop;
		if (
			relativeY > dimensions.paddleHeight / 2 &&
			relativeY < dimensions.height - dimensions.paddleHeight / 2
		) {
			paddles[index] = relativeY - dimensions.paddleHeight / 2;
		}
	}

	function rotate(x: number, y: number, angle: number): { x: number; y: number } {
		return {
			x: x * Math.cos(angle) - y * Math.sin(angle),
			y: x * Math.sin(angle) + y * Math.cos(angle)
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
		const wallRight = dimensions.width - dimensions.ballRadius - dimensions.paddleWidth;
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
				(ball.y - (paddles[0] + dimensions.paddleHeight / 2)) / (dimensions.paddleHeight / 2);
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
				(ball.y - (paddles[1] + dimensions.paddleHeight / 2)) / (dimensions.paddleHeight / 2);
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
		} else if (ball.y > dimensions.height - dimensions.ballRadius && ball.dy > 0) {
			const offset = Math.abs(ball.y - (dimensions.height - dimensions.ballRadius));
			ball.y = dimensions.height - dimensions.ballRadius - offset;
			ball.dy = -ball.dy;
		}
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
		socket.on('update', (data) => {
			ball = { ...data };
			serverBall = { ...data };
			update();
		});
		socket.on('index', (data: 0 | 1) => {
			index = data;
		});
		socket.on('paddle', (data: number) => {
			paddles[Math.abs(index - 1)] = data;
		});
		setInterval(() => {
			socket.emit('update', paddles[index]);
		}, 1000 / 60);
		setInterval(() => {
			update();
		}, 1000 / 60);
		update();
		draw(ctx);
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
			border: 1px solid black;
			background-color: grey;
			&:hover {
				cursor: none;
			}
		}
	}
</style>
