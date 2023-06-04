<script lang="ts">
	import Window from '$lib/components/desktop/Window.svelte';
	import Tab from '$lib/components/desktop/Tab.svelte';
	import Start from '$lib/components/desktop/Start.svelte';
	import {
		openFriendRequest,
		openChatWindow,
		time,
		appInstances,
		zstack,
		selected,
		user,
		socket,
		token,
		chats
	} from '$lib/stores/stores';
	import type { App } from '$lib/types/types';
	import { addInstance, removeInstance, putOnTop } from '$lib/utils/appinstance';
	import { onMount } from 'svelte';
	import { connectSocket, getUser, getFriends, getAllUserChats, getFriendRequest } from '$lib/utils/connect';

	$: {
		if ($openChatWindow) {
			addInstance('ChatWindow');
			$selected = null;
			openChatWindow.set(false);
		}
		if ($openFriendRequest) {
			addInstance('FriendRequest');
			$selected = null;
			openFriendRequest.set(false);
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
		Profile: {
			TabProps: { name: 'Profile', icon: '/computer.png' },
			DesktopProps: { name: 'Profile', icon: '/computer.png' }
		},
		Conversation: {
			TabProps: { name: 'Conversation', icon: '/mail3.png' },
			DesktopProps: { name: 'Conversation', icon: '/big-mail.png' }
		},
		ChatWindow: {
			TabProps: { name: 'MSN(enlever)', icon: '/mail3.png' },
			DesktopProps: { name: 'MSN(enlever)', icon: '/big-mail.png' }
		},
		Contact: {
			TabProps: { name: 'Contact', icon: '/phone.png' },
			DesktopProps: { name: 'Contact', icon: '/phone.png' }
		},
		Pong: {
			TabProps: { name: 'Pong', icon: '/pong.png' },
			DesktopProps: { name: 'Pong', icon: '/big-pong.png' }
		},
		FriendRequest : {
			TabProps: { name: 'FriendRequest', icon: '/computer.png' },
			DesktopProps: { name: 'FriendRequest', icon: '/computer.png' }
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
		getFriends();
		getFriendRequest();
		connectSocket();
		await getAllUserChats();

		$socket!.on('friend', (data: { message: string }) => {
			console.log('add-friend', data.message);
			//$socket!.emit('accept-friend', { response: true, friend: data.message });
		});

		$socket!.on('game', (data: { message: string }) => {
			console.log('accept-game', data.message);
			$socket!.emit('accept-game', { response: true, friend: data.message });
		});

		chats.subscribe(($chats) => {
			$chats.forEach((chat) => {
				if (chat.isGroupChat) $socket!.emit('joinRoom', { chatId: chat.id });
			});
		});

		$socket!.on('addchat', (chat) => {
			chats.update((chatsValue) => [...chatsValue, chat]);
		});

		$socket!.on('message', ({ chatId, message }) => {
			let targetChatIndex = $chats.findIndex((chat) => chat.id === chatId);
			if (targetChatIndex !== -1) {
				let chatscopy = [...$chats];
				chatscopy[targetChatIndex].messages.push(message);
				$chats = chatscopy;
			} else {
				console.error(`Received message for unknown chat with id: ${chatId}`);
			}
		});
	});
</script>

<div
	class="desktop"
	bind:clientWidth={width}
	bind:clientHeight={height}
	on:mousedown={() => ($selected = null)}
>
	<div class="icons">
		{#each Object.entries(apps) as [k, v]}
			{#if k !== 'FriendRequest' && k !== 'ChatWindow'}
				<div
					class="icon"
					on:dblclick={() => {
						addInstance(k);
						$selected = null;
					}}
				>
					  <img src={v.DesktopProps.icon} alt={v.DesktopProps.name} draggable="false" />
					<div class="icon-text">
					  <span>{v.DesktopProps.name}</span>
					</div>
				</div>
			{/if}
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
	<Start desktopHeight={height} />
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
			<img
				on:mousedown={() => {
					soundOn = !soundOn;
				}}
				src={soundOn ? 'sound-on.png' : 'sound-off.png'}
				alt={soundOn ? 'sound on' : 'sound off'}
				draggable="false"
			/>
			{formatter.format($time)}
		</p>
	</div>
</nav>

<style lang="scss">
		.icons {
			// put the icons to the left of the screen
			position: absolute;
			left: 0;
			top: 0;
			width: 7rem;
			height: 100%;
			display: flex;
			flex-direction: column;
		}

		.icon {
			margin: 1rem;
			display: flex;
			flex-direction: column;
			align-items: center;
		}

		img {
			width: 2.6rem;
		}

		.icon-text {
			color: white;
			margin-top: 0.19rem; /* Add margin to the top of the text */
			font-size: 0.9rem; /* Adjust the font size as desired */
		}

	div.desktop {
		height: calc(100vh - $navbar-height);
		position: relative;
	}

	@include navbar;
</style>
