<script lang="ts">
	import Window from '$lib/components/Window.svelte';
	import Pong from '$lib/components/game/Pong.svelte';
	import Square from '$lib/components/Square.svelte';
	import Tab from '$lib/components/Tab.svelte';

	let windows: any[] = [];
	let zstack: number[] = [];

	function putOnTop(id: number) {
		zstack = [...zstack.filter((z) => z !== id), id];
	}

	function remove(id: number) {
		windows = windows.filter((_, i) => i !== id);
		zstack = zstack.filter((z) => z !== id).map((z) => (z > id ? z - 1 : z));
	}

	let width: number;
	let height: number;

	function handleDoubleClickIcon(componentType: any) {
		zstack = [...zstack, zstack.length];
		const n = Math.floor(Math.random() * 2);
		windows = [
			...windows,
			{ component: componentType, props: { color: ['purple', 'yellow'][n] }, me: {}, visible: true }
		];
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

	{#each windows as { component, props, me, visible }, i}
		<div on:mousedown={() => putOnTop(i)} style="visibility: {visible ? 'visible' : 'hidden'};">
			<Window
				parentWidth={width}
				parentHeight={height}
				z={zstack.indexOf(i)}
				on:minimize={() => (visible = !visible)}
				on:close={() => {
					remove(i);
				}}
			>
				<svelte:component this={component} bind:this={me} {...props} />
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
			{#each windows as { component, props, me, visible }, i (i)}
				<Tab route={me.url} name={me.name} on:click={() => (visible = !visible)}>
					<svelte:component this={component} bind:this={me} {...props} />
				</Tab>
			{/each}
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
