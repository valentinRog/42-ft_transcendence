<script lang="ts" context="module">
	import { get, writable, readable } from 'svelte/store';

	import Pong from '$lib/components/desktop/app/Pong.svelte';
	import ChatWindow from '$lib/components/desktop/app/Chat.svelte';
	import Contact from '$lib/components/desktop/app/Contact.svelte';
	import Profile from '$lib/components/desktop/app/Profile.svelte';
	import Conversation from '$lib/components/desktop/app/Conversation.svelte';
	import FriendRequest from '$lib/components/desktop/app/FriendRequest.svelte';

	export type App =
		| 'Pong'
		| 'ChatWindow'
		| 'Contact'
		| 'Profile'
		| 'Conversation'
		| 'FriendRequest';

	export interface AppInstance {
		readonly componentType: App;
		readonly component: any;
		visible: boolean;
		readonly id: number;
		readonly propsWin: Record<string, any>;
		readonly props: Record<string, any>;
	}

	export const components = readable({
		Pong: Pong,
		ChatWindow: ChatWindow,
		FriendRequest: FriendRequest,
		Contact: Contact,
		Profile: Profile,
		Conversation: Conversation
	});

	export const appInstances = writable<AppInstance[]>([]);
	export const zstack = writable<number[]>([]);
	export const gid = writable(0);
	export const selected = writable<number | null>(0);

	export function addInstance(
		componentType: string,
		propsWin: Record<string, any> = {},
		props: Record<string, any> = {}
	) {
		zstack.set([...get(zstack), get(zstack).length]);
		appInstances.set([
			...get(appInstances),
			{
				componentType: componentType as App,
				component: get(components)[componentType as App],
				visible: true,
				id: get(gid),
				propsWin,
				props
			}
		]);
		gid.set(get(gid) + 1);
	}

	export const time = readable(new Date(), function start(set) {
		const interval = setInterval(() => {
			set(new Date());
		}, 1000);

		return function stop() {
			clearInterval(interval);
		};
	});
</script>

<script lang="ts">
	import Window from '$lib/components/desktop/Window.svelte';
	import Tab from '$lib/components/desktop/Tab.svelte';
	import Start from '$lib/components/desktop/Start.svelte';
	import { user, socket } from '$lib/stores/stores';
	import { chats, openChatWindow } from '$lib/components/desktop/app/Chat.svelte';
	import { openFriendRequest } from '$lib/components/desktop/app/Contact.svelte';
	import { onMount } from 'svelte';
	import {
		connectSocket,
		getUser,
		getFriends,
		getAllUserChats,
		getFriendRequest
	} from '$lib/utils/connect';

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
