<script lang="ts">
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let z = 0;

	export let parentWidth: number;
	export let parentHeight: number;

	export let visible = true;

	let top = parentHeight / 2;
	let left = parentWidth / 2;

	let width: number;
	let height: number;

	$: {
		if (top + height > parentHeight) top = Math.max(parentHeight - height, 0);
		if (left + width > parentWidth) left = Math.max(parentWidth - width, 0);
		if (top < 0) top = 0;
		if (left < 0) left = 0;
	}

	let moving = false;
	onMount(() => {
		top -= height / 2;
		left -= width / 2;
	});

	function onMouseMove(e: MouseEvent) {
		if (!moving) return;
		left += e.movementX;
		top += e.movementY;
	}
</script>

<section
	style="left: {left}px; top: {top}px; z-index: {z};visibility: {visible ? 'visible' : 'hidden'};"
	bind:offsetWidth={width}
	bind:offsetHeight={height}
	on:mousedown
>
	<div on:mousedown={() => (moving = true)}>
		<button on:click={() => dispatch('minimize')}>-</button>
		<button on:click={() => dispatch('close')}>x</button>
	</div>
	<slot />
</section>

<svelte:window on:mouseup={() => (moving = false)} on:mousemove={onMouseMove} />

<style lang="scss">
	section {
		position: absolute;
		top: 5rem;
		left: 5rem;
		border: 0.2rem solid black;
		user-select: none;

		& > div {
			height: 2rem;
			background-color: blue;

			&:hover {
				cursor: grab;
			}
		}

		button {
			font-size: 1.3rem;
		}
	}
</style>
