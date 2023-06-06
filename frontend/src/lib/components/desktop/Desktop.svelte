<script lang="ts" context="module">
	import { token } from '$lib/stores/stores';
	import { get } from 'svelte/store';
	import { PUBLIC_BACKEND_URL } from '$env/static/public';

	export function getUser() {
		fetch(`${PUBLIC_BACKEND_URL}/users/me`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${get(token)}`
			}
		})
			.then((res) => res.json())
			.then((data) => {
				user.set({
					id: data.id,
					username: data.username,
					login: data.login
				});
			});
	}

	export async function getFriends() {
		const res = await fetch(`${PUBLIC_BACKEND_URL}/users/me/friends`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${get(token)}`
			}
		});
		return await res.json();
	}

	export async function getFriendRequest() {
		const res = await fetch(`${PUBLIC_BACKEND_URL}/notification/get?type=friend`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${get(token)}`
			}
		});
		const data = await res.json();
		Context.friendRequest().set(data);
		return data;
	}

	export async function getAllUserChats(chats: any) {
		const response = await fetch(`${PUBLIC_BACKEND_URL}/chat/allUserChats`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${get(token)}`,
				'Content-Type': 'application/json'
			}
		});
		if (response.ok) {
			const allUserChats = await response.json();
			chats.set(allUserChats);
		} else console.error(`Error fetching all messages: ${response.statusText}`);
	}
</script>

<script lang="ts">
	import Window from '$lib/components/desktop/Window.svelte';
	import Tab from '$lib/components/desktop/Tab.svelte';
	import Start from '$lib/components/desktop/Start.svelte';
	import { user, socket } from '$lib/stores/stores';
	import { onMount } from 'svelte';
	import { connectSocket } from '$lib/utils/connect';
	import { Context } from '$lib/components/desktop/Context.svelte';

	const chats = Context.chats();
	const chatId = Context.chatId();
	const openChatWindow = Context.openChatWindow();
	const friendInfo = Context.friendInfo();

	const openFriendRequest = Context.openFriendRequest();

	const appInstances = Context.appInstances();
	const zstack = Context.zstack();
	const selected = Context.selected();

	const addInstance = Context.addInstance();

	const time = Context.time();

	function removeInstance(id: number) {
		appInstances.set(get(appInstances).filter((_, i) => i !== id));
		zstack.set(
			get(zstack)
				.filter((z) => z !== id)
				.map((z) => (z > id ? z - 1 : z))
		);
	}

	function putOnTop(id: number) {
		zstack.set([...get(zstack).filter((z) => z !== id), id]);
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
			$addInstance('Chat', { typeChat: typeChat, name: name });
			$selected = null;
			openChatWindow.set(false);
		}
		if ($openFriendRequest) {
			$addInstance('FriendRequest');
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

	// CLOCK

	const formatter = new Intl.DateTimeFormat('en', {
		hour12: false,
		hour: 'numeric',
		minute: '2-digit'
	});

	let soundOn: boolean = true;

	const contacts = Context.contacts();
	getFriends().then((data) => contacts.set(data));
	getUser();
	getAllUserChats(chats);
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
						$addInstance(k);
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
