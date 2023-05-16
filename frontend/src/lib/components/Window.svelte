<script lang="ts">
	import {onMount} from "svelte";
	export let z = 0;
	
	export let parentWidth: number;
	export let parentHeight: number;

	export let top = parentHeight / 2;
	export let left = parentWidth / 2;

	let width: number;
	let height: number;

	let moving = false;
	onMount(() => { top -= height / 2; left -= width / 2; })

	export let windowVisible = true;

	function onMouseMove(e: MouseEvent) {
		if (!moving) return;
		if (left + e.movementX < 0) {
			left = 0;
		} else if (left + e.movementX > parentWidth - width) {
			left = parentWidth - width;
		} else {
			left += e.movementX;
		}
		if (top + e.movementY < 0) {
			top = 0;
		} else if (top + e.movementY > parentHeight - height) {
			top = parentHeight - height;
		} else {
			top += e.movementY;
		}
	}
</script>

<section
	style="left: {left}px; top: {top}px; z-index: {z};"
	bind:offsetWidth={width}
	bind:offsetHeight={height}
>
	<div on:mousedown={() => (moving = true)} />
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
	}
</style>
