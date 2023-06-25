<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Context } from '$lib/components/app/Profile/Context.svelte';
	import type { Writable } from 'svelte/store';

	const fetchHistory = Context.fetchHistory();
	const fetchWithToken = Context.fetchWithToken();
	const socket = Context.socket();
	const settings = Context.settings();
	const soundOn = Context.soundOn();
	const room = Context.room() as Writable<Context.Room>;
	const sounds = Context.sounds();
	const serverClockDelta = Context.serverClockDelta();

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

	type Input = {
		room: string;
		clientId: string;
		stateId: number;
		clientTime: number;
		serverTime: number;
		up: boolean;
		down: boolean;
	};

	function update(state: Context.GameState, delta: number): Context.GameState {
		const s = structuredClone(state) as Context.GameState;
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
				if ($soundOn) $sounds.paddle.play();
				const dyMax = 0.9;
				const distToCenter =
					ball.y + dimensions.ballWidth / 2 - s.paddles[0].y - dimensions.paddleHeight / 2;
				const dy = dyMax * (distToCenter / (dimensions.paddleHeight / 2));
				ball.dx = 1;
				ball.dy = dy;
				ball.x = wallLeft + (wallLeft - ball.x);
			} else if (ball.x + dimensions.ballWidth < 0) {
				if ($soundOn) $sounds.score.play();
				ball.x = dimensions.width / 2 - dimensions.ballWidth / 2;
				ball.y = dimensions.height / 2 - dimensions.ballWidth / 2;
				ball.dx = 1;
				ball.dy = 0;
				s.missed = false;
				s.player2Score++;
			} else {
				s.missed = true;
			}
		} else if (ball.x + dimensions.ballWidth >= wallRight && ball.dx > 0) {
			if (
				!s.missed &&
				ball.y + dimensions.ballWidth >= s.paddles[1].y &&
				ball.y <= s.paddles[1].y + dimensions.paddleHeight
			) {
				if ($soundOn) $sounds.paddle.play();
				const dyMax = 0.9;
				const distToCenter =
					ball.y + dimensions.ballWidth / 2 - s.paddles[1].y - dimensions.paddleHeight / 2;
				const dy = dyMax * (distToCenter / (dimensions.paddleHeight / 2));
				ball.dx = -1;
				ball.dy = dy;
				ball.x = wallRight - dimensions.ballWidth - (ball.x + dimensions.ballWidth - wallRight);
			} else if (ball.x > dimensions.width) {
				if ($soundOn) $sounds.score.play();
				ball.x = dimensions.width / 2 - dimensions.ballWidth / 2;
				ball.y = dimensions.height / 2 - dimensions.ballWidth / 2;
				ball.dx = -1;
				ball.dy = 0;
				s.missed = false;
				s.player1Score++;
			} else {
				s.missed = true;
			}
		}

		if (ball.y <= 0 && ball.dy < 0) {
			if ($soundOn) $sounds.wall.play();
			ball.y = -ball.y;
			ball.dy *= -1;
		} else if (ball.y >= dimensions.height - dimensions.ballWidth && ball.dy > 0) {
			if ($soundOn) $sounds.wall.play();
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

	const tickRate = 30;
	const delay = 20;
	let inputs = new Array<Input>();
	let up = false;
	let down = false;

	export let scale = 1;

	function draw(ctx: CanvasRenderingContext2D) {
		const s = update($room.state, Date.now() - $room.state.time);
		ctx.clearRect(0, 0, dimensions.width * scale, dimensions.height * scale);
		ctx.fillStyle = 'white';
		ctx.fillRect(
			s.ball.x * scale,
			s.ball.y * scale,
			dimensions.ballWidth * scale,
			dimensions.ballWidth * scale
		);
		ctx.fillRect(
			dimensions.paddleOffset * scale,
			s.paddles[0].y * scale,
			dimensions.paddleWidth * scale,
			dimensions.paddleHeight * scale
		);
		ctx.fillRect(
			dimensions.width * scale - dimensions.paddleWidth * scale - dimensions.paddleOffset * scale,
			s.paddles[1].y * scale,
			dimensions.paddleWidth * scale,
			dimensions.paddleHeight * scale
		);

		ctx.setLineDash([5, 5]);
		ctx.strokeStyle = 'white';
		ctx.beginPath();
		ctx.moveTo((dimensions.width / 2) * scale, 0);
		ctx.lineTo((dimensions.width / 2) * scale, dimensions.height * scale);
		ctx.stroke();

		ctx.font = '40px pong-score';
		ctx.fillStyle = 'white';
		const getPlayerScoreOffset = (score: number) => {
			if (score <= 9) return 12;
			return 17 * (Math.floor(Math.log10(score)) + 1);
		};
		const offset1 = getPlayerScoreOffset(s.player1Score);
		const offset2 = getPlayerScoreOffset(s.player2Score);
		ctx.fillText(s.player1Score.toString(), (dimensions.width * scale) / 4 - offset1, 60);
		ctx.fillText(s.player2Score.toString(), (3 * dimensions.width * scale) / 4 - offset2, 60);

		requestAnimationFrame(() => draw(ctx));
	}

	setInterval(() => {
		const input: Input = {
			room: $room.room,
			clientId: $socket.id,
			stateId: $room.state.id + delay,
			clientTime: Date.now() + delay,
			serverTime: Date.now() + delay + $serverClockDelta,
			up,
			down
		};
		$socket.emit('input', input);
		inputs.push(input);
		if (inputs.length > 100) {
			inputs.shift();
		}
	}, 1000 / tickRate);

	setInterval(() => $socket.emit('ping', Date.now()), 1000);

	let canvas: HTMLCanvasElement;

	onMount(() => {
		const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
		draw(ctx);
	});

	$: if (canvas !== undefined) {
		canvas.width = dimensions.width * scale;
		canvas.height = dimensions.height * scale;
	}

	$socket.on('game-over', (winner: number) => {
		console.log('game over');
		fetchHistory();
		//if (winner === 0) {
		//	alert('Player 1 wins!');
		//} else {
		//	alert('Player 2 wins!');
		//}
	});

	$socket.on('state', (s: Context.GameState) => {
		s.time -= $serverClockDelta;
		while (inputs.length && inputs[0].clientTime < s.time) {
			inputs.shift();
		}
		for (let i = 1; i < inputs.length && inputs[i].clientTime <= Date.now(); i++) {
			s = update(s, inputs[i].clientTime - inputs[i - 1].clientTime);
			s.paddles[$room.index].up = inputs[i].up;
			s.paddles[$room.index].down = inputs[i].down;
			s.time = inputs[i].clientTime;
			s.id = inputs[i].stateId;
		}
		$room.state = s;
	});

	onDestroy(() => {
		if ($room.room !== '') {
			$socket.emit('leave-room', { room: $room.room, index: $room.index });
		} else {
			fetchWithToken('matchmaking/unqueue', {
				method: 'POST'
			});
		}
		$socket.off('ping');
		$socket.off('state');
		$socket.off('input');
	});

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === $settings.up) {
			up = true;
		} else if (e.key === $settings.down) {
			down = true;
		}
	}

	function handleKeyUp(e: KeyboardEvent) {
		if (e.key === $settings.up) {
			up = false;
		} else if (e.key === $settings.down) {
			down = false;
		}
	}
</script>

<svelte:window on:keydown={handleKeyDown} on:keyup={handleKeyUp} />

<div class="container">
	<canvas bind:this={canvas} />
	<p>{$room.opponent}</p>
</div>

<style lang="scss">
	canvas {
		background-color: black;
	}
</style>
