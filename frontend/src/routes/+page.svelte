<script lang="ts">
	import Window from '$lib/components/Window.svelte';
	import Tab from '$lib/components/Tab.svelte';
	import Start from '$lib/components/Start.svelte';
	import { openChatWindow , time, appInstances, zstack} from '$lib/stores/stores';
	import type {App, AppInstance} from '$lib/types/types';
	import { addInstance, removeInstance, putOnTop } from '$lib/scripts/appinstance';

	$: {
		if ($openChatWindow) {
			addInstance('ChatWindow');
			selected = null;
			openChatWindow.set(false);
		}
	}

	interface AppProps {
		readonly desktopName: string;
		readonly tabName: string;
		readonly desktopIcon: string;
		readonly tabIcon: string;
		readonly username?: string;
	}

	const apps: Record<App, AppProps> = {
		Pong: { desktopName: 'Pong', tabName: 'Pong', desktopIcon: '/big-pong.png', tabIcon: '/pong.png'},
		ChatWindow: { desktopName: 'MSN', tabName: 'MSN', desktopIcon: '/big-mail.png', tabIcon: '/mail3.png' },
		Contact: { desktopName: 'Contact', tabName: 'Friends of lrondia', desktopIcon: '/phone.png', tabIcon: '/phone.png' },
		Profile: { desktopName: 'Profile', tabName: 'Profile of lrondia', desktopIcon: '/computer.png', tabIcon: '/computer.png' }
	};

	Object.freeze(apps);

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
			<div class="icon" on:dblclick={() => { addInstance(k); selected = null;}}>
				<img src={v.desktopIcon} alt={v.desktopName} draggable="false"/>
				<span>{v.desktopName}</span>
			</div>
		{/each}
	</div>

	{#each $appInstances as { componentType, component, visible, id }, i (id)}
		<Window
			{...apps[componentType]}
			parentWidth={width}
			parentHeight={height}
			z={$zstack.indexOf(i)}
			{visible}
			on:minimize={() => {
				visible = !visible;
				selected = null;
			}}
			on:close={() => removeInstance(i)}
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

<nav class="navbar" style:z-index={$zstack.length}>
	<Start />
	<div class="navbar-tabs">
		{#each $appInstances as { componentType, visible, id }, i (id)}
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
