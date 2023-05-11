<script lang="ts">
	export let left = 300;
	export let top = 300;

	let moving = false;

	function onMouseMove(e: MouseEvent) {
		if (moving) {
			left += e.movementX;
			top += e.movementY;
		}
	}
</script>

<section on:mousedown={() => (moving = true)} style="left: {left}px; top: {top}px;">
	<slot />
</section>

<svelte:window on:mouseup={() => (moving = false)} on:mousemove={onMouseMove} />

<style lang="scss">
	section {
		position: absolute;
		top: 0;
		left: 0;
		display: flex;

		&:hover {
			cursor: grab;
		}
	}
</style>
