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
		png: string;
		readonly drawOption: (event: MouseEvent) => void;
		readonly action: (event: MouseEvent) => void;
	}

	type Tool = 'Pen' | 'Brush' | 'Rectangle' | 'Plop';

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
			png: 'pencill.png',
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
			png: 'brush.png',
			action: () => {
				console.log('Fonction de ma BRUSH !');
			}
		},
		Rectangle: {
			name: 'rectangle',
			lineWidth: 5,
			color: 'red',
			lineCap: 'butt',
			lineJoin: 'miter',
			drawOption: drawRectangle,
			startX: 0,
			startY: 0,
			png: 'rectanglee.png',
			action: () => {
				console.log('Fonction de ma Rectangle !');
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
			png: 'spectator.png',
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
		type: 'line';
		startX: number;
		startY: number;
		endX: number;
		endY: number;
		lineWidth: number;
		color: string;
	};

	type Rectangle = {
		type: 'rectangle';
		startX: number;
		startY: number;
		width: number;
		height: number;
		lineWidth: number;
		color: string;
	};

	let shapes: (Line | Rectangle)[] = [];

	function startDrawing(event: MouseEvent) {
		isDrawing = true;
		toolSelected.startX = event.offsetX;
		toolSelected.startY = event.offsetY;
		ctx.strokeStyle = color;
		ctx.lineWidth = toolSelected.lineWidth;
		ctx.beginPath();
		ctx.moveTo(toolSelected.startX, toolSelected.startY);
	}

	function drawOldStuff() {
		shapes.forEach((shape) => {
			ctx.lineWidth = shape.lineWidth;
			ctx.strokeStyle = shape.color;
			if (shape.type === 'rectangle') {
				if (shape.startX !== 0 && shape.startY !== 0) {
					ctx.strokeRect(shape.startX, shape.startY, shape.width, shape.height);
				}
			} else if (shape.type === 'line') {
				ctx.beginPath();
				ctx.moveTo(shape.startX, shape.startY);
				ctx.lineTo(shape.endX, shape.endY);
				ctx.stroke();
			}
		});
	}

	function drawRectangle(event: MouseEvent) {
		if (!isDrawing) return;
		const { offsetX, offsetY } = event;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		drawOldStuff();
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
		shapes.push({
			type: 'line',
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
		shapes.push({
			type: 'rectangle',
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
		shapes = [];
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
					<div
						class="each-tool {toolSelected === tools.Pen ? 'selected' : ''}"
						on:click={() => {
							toolSelected = tools.Pen;
						}}
					>
						<img class="tool-logo" src="/pencil.png" />
					</div>
					<div
						class="each-tool {toolSelected === tools.Brush ? 'selected' : ''}"
						on:click={() => {
							toolSelected = tools.Brush;
						}}
					>
						<img class="tool-logo" src="/brush.png" />
					</div>
					<div
						class="each-tool {toolSelected === tools.Rectangle ? 'selected' : ''}"
						on:click={() => {
							toolSelected = tools.Rectangle;
						}}
					>
						<img class="tool-logo" src="/rectangle.png" />
					</div>
					<div
						class="each-tool {toolSelected === tools.Plop ? 'selected' : ''}"
						on:click={() => {
							toolSelected = tools.Plop;
						}}
					>
						<img class="tool-logo" src="/spectator.png" />
					</div>
				</div>
			</div>
		</div>
		<canvas
			bind:this={canvas}
			on:mousedown={startDrawing}
			on:mousemove={toolSelected.drawOption}
			on:mouseup={stopDrawing}
			on:mouseleave={stopDrawing}
			style="{`cursor: url(${toolSelected.png}) 0 15, auto;`}"
		/>
	</div>
	<div class="color-pick">
		{#each colors as c}
			<div
				class="color {color === c ? 'selected' : ''}"
				style:background={c}
				on:click={() => (color = c)}
			/>
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
			width: 4.5rem;
			margin: 0.2rem;
			.tool-box {
				@include tab-border($light-grey, $dark-grey);
				margin: 0.2rem;
				.tools {
					display: flex;
					flex-direction: row;
					flex-wrap: wrap;
					.each-tool {
						margin: 0.15rem;
						padding: 0.1rem;
						height: 1.5rem;
						width: 1.5rem;
						@include tab-border($dark-grey, $light-grey);
						.tool-logo {
							display: block;
							max-width: 1.15rem;
							height: 1rem;
							margin: 0 auto;
						}
					}
					.selected {
						@include tab-border(white, black);
					}
				}
			}
		}

		canvas {
			margin: 0.2rem;
			background: white;
			// background: $dark-grey;
			@include tab-border($light-grey, $dark-grey);
		}
	}

	div.color-pick {
		display: flex;
		margin: 0.2rem;
		@include tab-border($light-grey, $dark-grey);
		height: fit-content;
		width: fit-content;
		div.color {
			width: 1.2rem;
			height: 1.2rem;
			margin: 0.15rem;
			@include tab-border(transparent, black);

			&.selected {
			}
		}
	}
</style>
