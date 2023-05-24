<script lang="ts">
	import Window from '$lib/components/Window.svelte';
	import Pong from '$lib/components/pong/Pong.svelte';
	import ChatWindow from '$lib/components/ChatWindow.svelte';
	import Contact from '$lib/components/Contact.svelte';
	import Profile from '$lib/components/Profile.svelte';
	import Tab from '$lib/components/Tab.svelte';
	import Start from '$lib/components/Start.svelte';
	import { openChatWindow } from '$lib/stores/stores';
	import { time } from '$lib/stores/stores.ts';

	$: {
		if ($openChatWindow) {
			addInstance('ChatWindow');
			openChatWindow.set(false);
		}
	}

	const components = {
		Pong: Pong,
		ChatWindow: ChatWindow,
		Contact: Contact,
		Profile: Profile
	};
	Object.freeze(components);

	type App = keyof typeof components;

	interface AppProps {
		readonly name: string;
		readonly tabIcon: string;
		readonly desktopIcon: string;
	}
	const apps: Record<App, AppProps> = {
		Pong: { name: 'Pong', desktopIcon: '/big-pong.png', tabIcon: '/pong.png' },
		ChatWindow: { name: 'Chat', desktopIcon: '/big-mail.png', tabIcon: '/mail3.png' },
		Contact: { name: 'Contact', desktopIcon: '/phone.png', tabIcon: '/phone.png' },
		Profile: { name: 'Profile', desktopIcon: '/computer.png', tabIcon: '/computer.png' }
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
	let openChats: string[] = [];

	let gid = 0;
	function addInstance(componentType: string, chatRecipient?: string) {
		if (componentType === "ChatWindow" && chatRecipient && !openChats.includes(chatRecipient)) {
			openChats.push(chatRecipient);
		}
		else {
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
				<img src={v.desktopIcon} alt={v.name} draggable="false"/>
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
