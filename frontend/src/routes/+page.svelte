<script lang="ts">
	import Window from '$lib/components/Window.svelte';
	import Tab from '$lib/components/Tab.svelte';
	import Start from '$lib/components/Start.svelte';
	import { openChatWindow, time, appInstances, zstack, selected, user, token, chats } from '$lib/stores/stores';
	import type { App } from '$lib/types/types';
	import { addInstance, removeInstance, putOnTop } from '$lib/scripts/appinstance';
	import { onMount } from 'svelte';
	import { connectSocket, getUser } from '$lib/scripts/connect';
	import { connect } from 'socket.io-client';

	$: {
		if ($openChatWindow) {
			addInstance('ChatWindow');
			$selected = null;
			openChatWindow.set(false);
		}
	}

	interface Props {
		readonly name: string;
		readonly icon: string;
	}

	interface AppProps {
		readonly TabProps: Props;
		readonly DesktopProps: Props;
	}

	const apps: Record<App, AppProps> = {
		Pong: {
			TabProps: { name: 'Pong', icon: '/pong.png' },
			DesktopProps: { name: 'Pong', icon: '/big-pong.png' }
		},
		ChatWindow: {
			TabProps: { name: 'MSN', icon: '/mail3.png' },
			DesktopProps: { name: 'MSN', icon: '/big-mail.png' }
		},
		Contact: {
			TabProps: { name: 'Contact', icon: '/phone.png' },
			DesktopProps: { name: 'Contact', icon: '/phone.png' }
		},
		Profile: {
			TabProps: { name: 'Profile', icon: '/computer.png' },
			DesktopProps: { name: 'Profile', icon: '/computer.png' }
		}
	};

	Object.freeze(apps);

	let width: number;
	let height: number;

	// CLOCK

	const formatter = new Intl.DateTimeFormat('en', {
		hour12: false,
		hour: 'numeric',
		minute: '2-digit'
	});

	let soundOn: boolean = true;


	onMount(async () => {
		getUser();
		connectSocket();
		await getAllUserChats();
	});

	async function getAllUserChats() {
		const response = await fetch('http://localhost:3000/chat/allUserChats', {
			method: 'GET',
      		headers: {
          		'Authorization': `Bearer ${$token}`,
				'Content-Type': 'application/json'
      		}
    	});
		if (response.ok) {
      		const allUserChats = await response.json();
      		chats.set(allUserChats);
    	} else
      		console.error(`Error fetching all messages: ${response.statusText}`);
	}
</script>

<div
	class="desktop"
	bind:clientWidth={width}
	bind:clientHeight={height}
	on:mousedown={() => ($selected = null)}
>
	<div class="icons">
		{#each Object.entries(apps) as [k, v]}
			<div
				class="icon"
				on:dblclick={() => {
					addInstance(k);
					$selected = null;
				}}
			>
				<img src={v.DesktopProps.icon} alt={v.DesktopProps.name} draggable="false" />
				<span>{v.DesktopProps.name}</span>
			</div>
		{/each}
	</div>
	{JSON.stringify($user)}
	{#each $appInstances as { componentType, component, visible, id, propsWin, props }, i (id)}
		<Window
			{...apps[componentType].TabProps}
			props={propsWin}
			parentWidth={width}
			parentHeight={height}
			z={$zstack.indexOf(i)}
			{visible}
			on:minimize={() => {
				visible = !visible;
				$selected = null;
			}}
			on:close={() => removeInstance(i)}
			on:mousedown={(event) => {
				event.stopPropagation();
				putOnTop(i);
				$selected = i;
			}}
		>
			<svelte:component this={component} {...props} />
		</Window>
	{/each}
</div>

<!-- NAVBAR -->

<nav class="navbar" style:z-index={$zstack.length}>
	<Start />
	<div class="navbar-tabs">
		{#each $appInstances as { componentType, visible, id, propsWin }, i (id)}
			<Tab
				{...apps[componentType].TabProps}
				props={propsWin}
				active={$selected === i}
				on:click={() => {
					putOnTop(i);
					if (visible && $selected === i) {
						visible = !visible;
						$selected = null;
					} else if (visible) {
						$selected = i;
					} else {
						visible = !visible;
						$selected = i;
					}
				}}
			/>
		{/each}
	</div>
	<div class="navbar-clock">
		<p>
			{#if soundOn}
				<img
					on:mousedown={() => {
						soundOn = !soundOn;
					}}
					src="/sound-on.png"
					alt="sound on"
				/>
			{:else}
				<img
					on:mousedown={() => {
						soundOn = !soundOn;
					}}
					src="/sound-off.png"
					alt="sound on"
				/>
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
