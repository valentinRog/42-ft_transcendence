<script lang="ts">
	import Window from '$lib/components/Window.svelte';
	import Tab from '$lib/components/Tab.svelte';
	import Start from '$lib/components/Start.svelte';
	import { user, socket } from '$lib/stores';
	import { onMount } from 'svelte';
	import { connectSocket } from '$lib/utils/connect';
	import { Context } from '$lib/components/Context.svelte';
	import Clock from './Clock.svelte';

	const chats = Context.chats();
	const chatId = Context.chatId();
	const openChatWindow = Context.openChatWindow();
	const friendInfo = Context.friendInfo();

	const openFriendRequest = Context.openFriendRequest();

	const appInstances = Context.appInstances();
	const zstack = Context.zstack();
	const selected = Context.selected();

	const addInstance = Context.addInstance();

	function removeInstance(id: number) {
		$appInstances = $appInstances.filter((_, i) => i !== id);
		$zstack = $zstack.filter((z) => z !== id).map((z) => (z > id ? z - 1 : z));
	}

	function putOnTop(id: number) {
		$zstack = [...$zstack.filter((z) => z !== id), id];
	}

	$: {
		if ($openChatWindow) {
			let typeChat;
			let name;
			if ($chatId === null || $chatId === undefined) name = $friendInfo?.username;
			else {
				let targetChat = $chats.find((chat) => chat.id === $chatId);

				if (targetChat?.isGroupChat) {
					name = targetChat.name;
					typeChat = 'Group';
				} else {
					name = targetChat?.chatUsers.find((u) => u.user.username !== $user?.username)?.user
						.username;
					typeChat = 'Chat';
				}
			}
			addInstance('Chat', { typeChat: typeChat, name: name });
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

	const apps: Record<Context.App, AppProps> = {
		Profile: {
			TabProps: { name: 'Profile', icon: '/computer.png' },
			DesktopProps: { name: 'Profile', icon: '/computer.png' }
		},
		Conversation: {
			TabProps: { name: 'Conversation', icon: '/mail3.png' },
			DesktopProps: { name: 'Conversation', icon: '/big-mail.png' }
		},
		Chat: {
			TabProps: { name: 'Chat', icon: '/mail3.png' },
			DesktopProps: { name: 'Chat', icon: '/big-mail.png' }
		},
		Contact: {
			TabProps: { name: 'Contact', icon: '/phone.png' },
			DesktopProps: { name: 'Contact', icon: '/phone.png' }
		},
		Pong: {
			TabProps: { name: 'Pong', icon: '/pong.png' },
			DesktopProps: { name: 'Pong', icon: '/big-pong.png' }
		},
		FriendRequest: {
			TabProps: { name: 'FriendRequest', icon: '/computer.png' },
			DesktopProps: { name: 'FriendRequest', icon: '/computer.png' }
		}
	};

	Object.freeze(apps);

	let width: number;
	let height: number;

	const fetchMe = Context.fetchMe();
	const fetchFriends = Context.fetchFriends();
	const fetchChats = Context.fetchChats();

	(async () => {
		await fetchMe();
		await fetchFriends();
		await fetchChats();
	})()

	connectSocket();

	onMount(() => {
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

		$socket!.on('addChat', (chat) => {
			chats.update((chatsValue) => [...chatsValue, chat]);
			console.log($chats);
		});

		$socket!.on('leaveChat', (chatId) => {
			chats.update((chatsValue) => chatsValue.filter((chat) => chat.id !== chatId));
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
			{#if k !== 'FriendRequest' && k !== 'Chat'}
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
	<Clock />
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
