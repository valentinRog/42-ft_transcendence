<script lang="ts">
	import Window from '$lib/components/Window.svelte';
	import Pong from '$lib/components/pong/Pong.svelte';
	import Square from '$lib/components/Square.svelte';
	import Contact from '$lib/components/Contact.svelte';
	import Profile from '$lib/components/Profile.svelte';
	import Tab from '$lib/components/Tab.svelte';
	import Start from '$lib/components/Start.svelte';
	import { time } from '$lib/stores/stores.ts';

	const components = {
		Pong: Pong,
		Square: Square,
		Contact: Contact,
		Profile: Profile
	};
	Object.freeze(components);

	type App = keyof typeof components;

	interface AppProps {
		readonly name: string;
		readonly icon: string;
	}
	const apps: Record<App, AppProps> = {
		Pong: { name: 'Pong', icon: '/pong.png' },
		Square: { name: 'Chat', icon: '/mail.png' },
		Contact: { name: 'Contact', icon: '/mail.png' },
		Profile: { name: 'Profile', icon: '/mail.png' }
	};
	Object.freeze(apps);

	interface AppInstance {
		readonly componentType: App;
		readonly component: any;
		visible: boolean;
		readonly id: number;
	}

	let instances: AppInstance[] = [];
	let zstack: number[] = [];

	let gid = 0;
	function addInstance(componentType: string) {
		zstack = [...zstack, zstack.length];
		instances = [
			...instances,
			{
				componentType: componentType as App,
				component: components[componentType as App],
				visible: true,
				id: gid++
			}
		];
		selected = null;
	}

	function putOnTop(id: number) {
		zstack = [...zstack.filter((z) => z !== id), id];
	}

	function remove(id: number) {
		instances = instances.filter((_, i) => i !== id);
		zstack = zstack.filter((z) => z !== id).map((z) => (z > id ? z - 1 : z));
	}

	let selected: number | null = null;

	let width: number;
	let height: number;

	// CLOCK
	
	const formatter = new Intl.DateTimeFormat(
		'en',
		{
			hour12: false,
			hour: 'numeric',
			minute: '2-digit'
		}
	);
	
	let soundOn: boolean = true;

</script>

<div
	class="desktop"
	bind:clientWidth={width}
	bind:clientHeight={height}
	on:mousedown={() => (selected = null)}
>
	<div class="icons">
		{#each Object.entries(apps) as [k, v]}
			<div class="icon" on:dblclick={() => addInstance(k)}>
				<img src={v.icon} alt={v.name} draggable="false"/>
				<span>{v.name}</span>
			</div>
		{/each}
	</div>

	{#each instances as { componentType, component, visible, id }, i (id)}
		<Window
			{...apps[componentType]}
			parentWidth={width}
			parentHeight={height}
			z={zstack.indexOf(i)}
			{visible}
			on:minimize={() => {
				visible = !visible;
				selected = null;
			}}
			on:close={() => remove(i)}
			on:mousedown={(event) => {
				event.stopPropagation();
				putOnTop(i);
				selected = i;
			}}
		>
			<svelte:component this={component} />
		</Window>
	{/each}
</div>

<!-- NAVBAR -->

<nav class="navbar" style:z-index={zstack.length}>
	<Start />
	<div class="navbar-tabs">
		{#each instances as { componentType, visible, id }, i (id)}
			<Tab
				{...apps[componentType]}
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
	<div class="navbar-clock">
<<<<<<< HEAD
		<p> 
			{#if soundOn}
				<img on:mousedown={() => { soundOn = !soundOn; }}
					src="/sound-on.png" alt="sound on" >
			{:else}
				<img on:mousedown={() => { soundOn = !soundOn; }}
					src="/sound-off.png" alt="sound on" >
			{/if}
			{formatter.format($time)} 
		</p>
=======
		<p>heure</p>
>>>>>>> a8df339e4abd7f07e8fb9d8278244fc8b5eea1e8
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
