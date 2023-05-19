<script lang="ts">
	import Window from '$lib/components/Window.svelte';
	import Pong from '$lib/components/game/Pong.svelte';
	import Square from '$lib/components/Square.svelte';
	import Contact from '$lib/components/Contact.svelte';
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

	let selected: number | null = null;

	let width: number;
	let height: number;

	let gid = 0;
	function handleDoubleClickIcon(componentType: any, props: Object = {}) {
		zstack = [...zstack, zstack.length];
		windows = [
			...windows,
			{
				component: componentType,
				props,
				me: {},
				visible: true,
				id: gid++
			}
		];
		selected = null;
	}
</script>

<!-- ICONES DE BUREAU -->

<div class="desktop" bind:clientWidth={width} bind:clientHeight={height}>
	<div class="icons">
		<div class="icon" on:dblclick={() => handleDoubleClickIcon(Pong)}>
			<img src="/pong.png" alt="pong" />
			<span>Pong</span>
		</div>
		<div class="icon" on:dblclick={() => handleDoubleClickIcon(Square, { })}>
			<img src="/mail.png" alt="chat" />
			<span>Chat</span>
		</div>
		<div class="icon" on:dblclick={() => handleDoubleClickIcon(Contact, { })}>
			<img src="/mail.png" alt="contact" />
			<span>Contact</span>
		</div>
	</div>

	{#each windows as { component, props, me, visible, id }, i (id)}
		<Window
			parentWidth={width}
			parentHeight={height}
			z={zstack.indexOf(i)}
			{visible}
			on:minimize={() => {
				visible = !visible;
				selected = null;
			}}
			on:close={() => remove(i)}
			on:mousedown={() => {
				putOnTop(i);
				selected = i;
			}}
		>
			<svelte:component this={component} bind:this={me} {...props} />
		</Window>
	{/each}
</div>

<!-- NAVBAR -->

<nav class="navbar" style="z-index: {zstack.length};">
	<div class="navbar-menu">
		<div class="navbar-start">
			<a class="start" href="/">
				<img src="/start.png" alt="start" />
				Start
			</a>
			{#each windows as { me, visible, id }, i (id)}
				<Tab
					route={me.url}
					name={me.name}
					active={selected === i}
					on:click={() => {
						putOnTop(i);
						if (visible && selected === i) {
							visible = !visible;
							selected = null;
						} else if (visible) {
							selected = i;
						} else {
							visible = !visible;
							selected = i;
						}
					}}
				/>
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
