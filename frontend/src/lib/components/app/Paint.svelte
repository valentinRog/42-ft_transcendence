<script lang="ts">
	import { onMount } from 'svelte';
	import DropDown from '$lib/components/drop/DropDown.svelte';

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let isDrawing = false;

	interface toolProps {
		readonly name: string;
		readonly lineWidth: number;
		readonly color: string;
		readonly lineCap: CanvasLineCap;
		readonly lineJoin: CanvasLineJoin;
		startX: number;
		startY: number;
		readonly drawOption: (event: MouseEvent) => void;
		readonly action: (event: MouseEvent) => void;
	}

	type Tool = 'Pen' | 'Brush' | 'Blob' | 'Plop';

	let tools: Record<Tool, toolProps> = {
		Pen: {
			name: 'pen',
			lineWidth: 5,
			color: 'red',
			lineCap: 'round',
			lineJoin: 'round',
			drawOption: draw,
			startX: 0,
			startY: 0,
			action: () => {
				console.log('Fonction de mon PEN !');
			}
		},
		Brush: {
			name: 'brush',
			lineWidth: 15,
			color: 'blue',
			lineCap: 'square',
			lineJoin: 'miter',
			drawOption: draw,
			startX: 0,
			startY: 0,
			action: () => {
				console.log('Fonction de ma BRUSH !');
			}
		},
		Blob: {
			name: 'blob',
			lineWidth: 5,
			color: 'red',
			lineCap: 'butt',
			lineJoin: 'miter',
			drawOption: drawRectangle,
			startX: 0,
			startY: 0,
			action: () => {
				console.log('Fonction de ma BLOB !');
			}
		},
		Plop: {
			name: 'plop',
			lineWidth: 15,
			color: 'blue',
			lineCap: 'butt',
			lineJoin: 'miter',
			drawOption: draw,
			startX: 0,
			startY: 0,
			action: () => {
				console.log('Fonction de mon PLOP !');
			}
		}
	};

	let toolSelected: toolProps = tools.Pen;

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

	let color: string = colors[0];

	onMount(() => {
		canvas.width = 800;
		canvas.height = 600;
		ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
	});

	type Line = {
		startX: number;
		startY: number;
		endX: number;
		endY: number;
		lineWidth: number;
		color: string;
	};

	type Rectangle = {
		startX: number;
		startY: number;
		width: number;
		height: number;
		lineWidth: number;
		color: string;
	};

	let lines: Line[] = [];
	let rectangles: Rectangle[] = [];

	function startDrawing(event: MouseEvent) {
		isDrawing = true;
		toolSelected.startX = event.offsetX;
		toolSelected.startY = event.offsetY;
		ctx.strokeStyle = color;
		ctx.lineWidth = toolSelected.lineWidth;
		ctx.beginPath();
		ctx.moveTo(toolSelected.startX, toolSelected.startY);
	}

	function drawRectangle(event: MouseEvent) {
		if (!isDrawing) return;
		const { offsetX, offsetY } = event;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		rectangles.forEach((rect) => {
			if (rect.startX !== 0 && rect.startY !== 0) {
				ctx.lineWidth = rect.lineWidth;
				ctx.strokeStyle = rect.color;
				ctx.strokeRect(rect.startX, rect.startY, rect.width, rect.height);
			}
		});

		lines.forEach((line) => {
			ctx.lineWidth = line.lineWidth;
			ctx.beginPath();
			ctx.moveTo(line.startX, line.startY);
			ctx.lineTo(line.endX, line.endY);
			ctx.strokeStyle = line.color;
			ctx.stroke();
		});
		
		ctx.beginPath();
		ctx.lineWidth = toolSelected.lineWidth;
		ctx.strokeStyle = color;
		const width = offsetX - toolSelected.startX;
		const height = offsetY - toolSelected.startY;
		ctx.strokeRect(toolSelected.startX, toolSelected.startY, width, height);
	}

	
	function draw(event: MouseEvent) {
		if (!isDrawing) return;
		const { offsetX, offsetY } = event;
		ctx.lineCap = toolSelected.lineCap;
		ctx.lineJoin = toolSelected.lineJoin;
		ctx.lineTo(offsetX, offsetY);
		ctx.strokeStyle = color;
		ctx.stroke();
		lines.push({
			startX: toolSelected.startX,
			startY: toolSelected.startY,
			endX: offsetX,
			endY: offsetY,
			lineWidth: toolSelected.lineWidth,
			color: color
		});
		toolSelected.startX = offsetX;
		toolSelected.startY = offsetY;
	}

	function stopDrawing(event: MouseEvent) {
		isDrawing = false;
		const width = event.offsetX - toolSelected.startX;
		const height = event.offsetY - toolSelected.startY;
		rectangles.push({
			startX: toolSelected.startX,
			startY: toolSelected.startY,
			width,
			height,
			lineWidth: toolSelected.lineWidth,
			color: color
		});
		toolSelected.startX = 0;
		toolSelected.startY = 0;
	}

	function clear() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		lines = [];
		rectangles = [];
	}
</script>

<div>
	<div class="menu">
		<DropDown name="File">
			<button on:click={clear}>New</button>
		</DropDown>
		<DropDown name="Edit">
			<button class="unavailable">Undo</button>
		</DropDown>
	</div>
	<div class="around-canvas">
		<div class="tools-and-props">
			<div class="tool-box">
				<div class="tools">
					<img
						class="tool-logo {toolSelected === tools.Pen ? 'selected' : ''}"
						on:click={() => {
							toolSelected = tools.Pen;
						}}
						src="/online.png"
					/>
					<img
						class="tool-logo {toolSelected === tools.Brush ? 'selected' : ''}"
						on:click={() => {
							toolSelected = tools.Brush;
						}}
						src="/offline.png"
					/>
					<img
						class="tool-logo {toolSelected === tools.Blob ? 'selected' : ''}"
						on:click={() => {
							toolSelected = tools.Blob;
						}}
						src="/in-game.png"
					/>
					<img
						class="tool-logo {toolSelected === tools.Plop ? 'selected' : ''}"
						on:click={() => {
							toolSelected = tools.Plop;
						}}
						src="/spectator.png"
					/>
				</div>
			</div>
		</div>
		<canvas
			bind:this={canvas}
			on:mousedown={startDrawing}
			on:mousemove={toolSelected.drawOption}
			on:mouseup={stopDrawing}
			on:mouseleave={stopDrawing}
		/>
	</div>
	<div class="color-pick">
		{#each colors as c}
			<div class="color" style:background={c} on:click={() => (color = c)} />
		{/each}
	</div>
</div>

<style lang="scss">
	div.menu {
		display: flex;
		height: 1.5rem;
		margin: 0 0.2rem;
		@include tab-border(white, $dark-grey);

		button:not(.unavailable) {
			@include dropdown-button;
		}

		button.unavailable {
			@include dropdown-button(false);
		}
	}

	.around-canvas {
		display: flex;

		.tools-and-props {
			@include tab-border($light-grey, $dark-grey);
			width: 4rem;
			margin: 0.2rem;
			.tool-box {
				@include tab-border($light-grey, $dark-grey);
				margin: 0.2rem;
				padding: 0.2rem;
				.tools {
					.tool-logo {
						padding: 0.1rem;
						height: 1.25rem;
						@include tab-border($dark-grey, $light-grey);
					}
					.selected {
						@include tab-border(white, black);
					}
				}
			}
		}

		canvas {
			// height: 25rem;
			margin: 0.2rem;
			background: white;
			@include tab-border($light-grey, $dark-grey);
		}
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
