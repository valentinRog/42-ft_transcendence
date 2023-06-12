<script lang="ts">
	import { onMount } from 'svelte';
	import DropDown from '$lib/components/drop/DropDown.svelte';
	import DropButton from '../drop/DropButton.svelte';

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let isDrawing = false;

	const colors = [
		'#FF0000',
		'#00FF00',
		'#0000FF',
		'#FFFF00',
		'#00FFFF',
		'#FF00FF',
		'#000000',
		'#FFFFFF'
	];

	let color = colors[0];

	onMount(() => {
		canvas.width = 800;
		canvas.height = 600;
		ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
	});

	function startDrawing(event: MouseEvent) {
		isDrawing = true;
		const { offsetX, offsetY } = event;
		ctx.strokeStyle = color;
		ctx.lineWidth = 4;
		ctx.beginPath();
		ctx.moveTo(offsetX, offsetY);
	}

	function draw(event: MouseEvent) {
		if (!isDrawing) return;
		const { offsetX, offsetY } = event;
		ctx.lineTo(offsetX, offsetY);
		ctx.stroke();
	}

	function stopDrawing() {
		isDrawing = false;
	}

	function clear() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	}
</script>

<div>
	<div class="menu">
		<DropDown name="File">
			<DropButton on:click={clear}>New</DropButton>
		</DropDown>
		<DropDown name="Edit" />
	</div>
	<canvas
		bind:this={canvas}
		on:mousedown={startDrawing}
		on:mousemove={draw}
		on:mouseup={stopDrawing}
		on:mouseleave={stopDrawing}
	/>
	<div class="color-pick">
		{#each colors as c}
			<div
				class="color"
				class:selected={color === c}
				style:background={c}
				on:click={() => (color = c)}
			/>
		{/each}
	</div>
</div>

<style lang="scss">
	div.menu {
		display: flex;
	}

	canvas {
		background: white;
	}

	div.color-pick {
		display: flex;

		div.color {
			width: 1.2rem;
			height: 1.2rem;
			margin: 0.15rem;
			border: 0.1rem solid transparent;

			&.selected {
				border-color: black;
			}
		}
	}
</style>
