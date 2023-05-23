<script lang="ts">
	import { onMount } from 'svelte';
	import { socket, token } from '$lib/stores/stores';
	import type { GameState, Input } from './pong';
	import { update, dimensions } from './pong';

	let ping = 0;
	let serverDelta = 0;
	const tickRate = 30;
	const delay = 20;

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
		async function connectToRoom() {
			const res = await fetch('http://localhost:3000/matchmaking/queue', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${$token}`
				},
				body: JSON.stringify({ token: $token })
			});
			console.log(res);
			const data = await res.text();
			console.log(data);
		}

		connectToRoom();

		$socket!.on('enter-room', (data: { room: string; index: number }) => {
			console.log('enter-room', data.room, data.index);
			$socket!.emit('enter-room', data);
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

		$socket!.on('state', (s: GameState) => {
			console.log('state', s);
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

		$socket!.on('index', (i: number) => {
			console.log('index', i);
			index = i;
		});

		function gameLoop() {
			const input: Input = {
				clientId: $socket!.id,
				stateId: state.id + delay,
				clientTime: Date.now() + delay,
				serverTime: Date.now() + delay + serverDelta,
				up,
				down
			};
			$socket!.emit('input', input);
			inputs.push(input);
			if (inputs.length > 100) {
				inputs.shift();
			}
			setTimeout(gameLoop, 1000 / tickRate);
		}
		gameLoop();

		function pingLoop() {
			$socket!.emit('ping', Date.now());
			setTimeout(pingLoop, 1000 / 3);
		}
		pingLoop();
		$socket!.on('ping', (data: [number, number]) => {
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
			margin: 0.2rem;
			background-color: black;
		}
	}
</style>
