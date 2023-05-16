<script lang="ts">
	import Window from '$lib/components/Window.svelte';
	import Pong from '$lib/components/game/Pong.svelte';
	import Square from '$lib/components/Square.svelte';
	import Tab from '$lib/components/Tab.svelte';
	import { missing_component } from 'svelte/internal';

	let windows: any[] = [
		// { component: Square, props: { color: 'yellow' }, me: {} },
		// { component: Square, props: { color: 'red' }, me: {} },
		// { component: Square, props: { color: 'green' }, me: {} }
		// { component: Pong, props: {}, me: {} },
	];

	let zstack = windows.map((_, i) => i);

	function putOnTop(id: number) {
		zstack = [...zstack.filter((z) => z !== id), id];
	}

	let width: number;
	let height: number;

	function handleDoubleClickIcon(componentType: any) {
		zstack.push(zstack.length);
		windows = [...windows, { component: componentType, props: { color: 'purple' }, me: {} }];
	}
</script>

<!-- ICONES DE BUREAU -->

<div class="desktop" bind:clientWidth={width} bind:clientHeight={height}>
	<div class="icons">
		<div class="icon" on:dblclick={() => handleDoubleClickIcon(Pong)}>
			<img src="/pong.png" alt="pong" />
			<span>Pong</span>
		</div>
		<div class="icon" on:dblclick={() => handleDoubleClickIcon(Square)}>
			<img src="/mail.png" alt="chat" />
			<span>Chat</span>
		</div>
	</div>

	{#each windows as { component, props, me }, i}
		<div on:mousedown={() => putOnTop(i)}>
			<Window parentWidth={width} parentHeight={height} z={zstack.indexOf(i)}>
				<svelte:component this={component} bind:this={me} {...props} />
			</Window>
			<span>{me.url}</span>
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
