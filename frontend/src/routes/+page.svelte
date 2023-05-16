<!-- <div class="icons">
	<div class="icon">
		<img src="/pong.png" alt="pong">
		<span>Pong</span>
	</div>
</div> -->
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

<!-- <h1>Yo</h1> -->

<!-- ICONES DE BUREAU -->

<div class="desktop" bind:clientWidth={width} bind:clientHeight={height}>
	{#each elements as { component, props }, i}
		<div on:mousedown={() => putOnTop(i)}>
			<Window parentWidth={width} parentHeight={height} z={zstack.indexOf(i)}>
				<svelte:component this={component} {...props} />
			</Window>
		</div>
	{/each}
</div>

<!-- NAVBAR -->

<nav class="navbar">
	<div class="navbar-menu">
		<div class="navbar-start">
			<a class="start" href="/">
				<img src="/start.png" alt="start" />
				Start
			</a>
			<a href="/">
				<img src="/pong.png" alt="pong" />
				Pong
			</a>
			<a href="/">
				<img src="/mail.png" alt="chat" />
				Chat
			</a>
		</div>
	</div>
</nav>

<style lang="scss">

	.icons {
		display: flex;
		align-items: left;

		.icon {
			margin: 1rem;
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 0.3rem;
			img {
				width: 4rem;
			}
			span {
				color: white;
			}
		}
	}

	div.desktop {
		height: calc(100vh - $navbar-height);
		position: relative;
	}

	@include navbar;
</style>
