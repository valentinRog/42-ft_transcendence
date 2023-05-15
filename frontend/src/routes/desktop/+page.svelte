<script lang="ts">
	import Window from '$lib/components/Window.svelte';
	import Pong from '$lib/components/game/Pong.svelte';
	import Square from '$lib/components/Square.svelte';

	type Element = {
		component: any;
		props: any;
	};
	const elements: Element[] = [
		{ component: Square, props: { color: 'yellow' } },
		{ component: Pong, props: {} },
		{ component: Square, props: { color: 'red' } },
		{ component: Square, props: { color: 'green' } }
	];

	let zstack = elements.map((_, i) => i);

	function putOnTop(id: number) {
		zstack = [...zstack.filter((z) => z !== id), id];
	}

	let width: number;
	let height: number;
</script>

<div class="desktop" bind:clientWidth={width} bind:clientHeight={height}>
	{#each elements as { component, props }, i}
		<div on:mousedown={() => putOnTop(i)}>
			<Window parentWidth={width} parentHeight={height} z={zstack.indexOf(i)}>
				<svelte:component this={component} {...props} />
			</Window>
		</div>
	{/each}
</div>

<style lang="scss">
	div.desktop {
		width: 90vw;
		height: 85vh;
		background-color: gray;
		margin: 0 auto;
		position: relative;
	}
</style>
