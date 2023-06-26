<script lang="ts">
	import Window from '$lib/components/Window.svelte';
	import Tab from '$lib/components/Tab.svelte';
	import Start from '$lib/components/Start.svelte';
	import { Context } from '$lib/components/Context.svelte';
	import Clock from './Clock.svelte';
	import NotificationBadge from './NotificationBadge.svelte';
	import { user } from '$lib/stores';

	const chats = Context.chats();
	const openChatWindow = Context.openChatWindow();
	const openChatForumWindow = Context.openChatForumWindow();
	const friendInfoId = Context.friendInfoId();
	const openPongWindow = Context.openPongWindow();
	const openFriendRequest = Context.openFriendRequest();
	const openEditProfile = Context.openEditProfile();
	const appInstances = Context.appInstances();
	const zstack = Context.zstack();
	const selected = Context.selected();
	const addInstance = Context.addInstance();
	const removeInstance = Context.removeInstance();

	const socket = Context.socket();

	function putOnTop(id: string) {
		$zstack = [...$zstack.filter((z) => z !== id), id];
	}

	$: {
		if ($openChatWindow) {
			addInstance('Chat', { friendId: $friendInfoId });
			$selected = null;
			openChatWindow.set(false);
		}
		if ($openChatForumWindow) {
			addInstance('ChatForum');
			$selected = null;
			openChatForumWindow.set(false);
		}
		if ($openFriendRequest) {
			addInstance('FriendRequest');
			$selected = null;
			openFriendRequest.set(false);
		}
		if ($openEditProfile) {
			addInstance('EditProfile');
			$selected = null;
			openEditProfile.set(false);
		}
		if ($openPongWindow) {
			addInstance('Pong');
			$selected = null;
			openPongWindow.set(false);
		}
	}

	const apps = Context.apps();

	let width: number;
	let height: number;

	const fetchMe = Context.fetchMe();
	const fetchFriends = Context.fetchFriends();
	const fetchGetUserBlocks = Context.fetchGetUserBlocks();
	const fetchChats = Context.fetchChats();
	const fetchFriendRequest = Context.fetchFriendRequest();
	const fetchGameRequest = Context.fetchGameRequest();
	const fetchUnreadConversations = Context.fetchUnreadConversations();
	const unreadConversations = Context.unreadConversations();
	const friendRequest = Context.friendRequest();
	const gameRequest = Context.gameRequest();

	let clickedImg : string = '';
	let clickedName : string = '';

	function changeColor(event : any, img : string, name : string) {
		clickedImg = img;
		clickedName = name;
		event.stopPropagation();
	}

	function handleOutsideClick() {
		clickedImg = '';
		clickedName = '';
	}

	(async () => {
		await fetchMe();
		await fetchFriends();
		await fetchGetUserBlocks();
		await fetchFriendRequest();
		await fetchGameRequest();

		fetchChats().then(() => {
			$chats.forEach((chat) => {
				if (chat.isGroupChat) $socket.emit('joinRoom', { chatId: chat.id });
			});
		});

	})();

	const notVisible = new Set(['FriendRequest', 'Chat', 'ChatForum', 'EditProfile', 'PongKeybinds']);
</script>

<div
	class="desktop"
	bind:clientWidth={width}
	bind:clientHeight={height}
	on:mousedown={() => ($selected = null)}
	on:click={handleOutsideClick}
>
	<div class="icons">
		{#each Object.entries($apps).filter(([k, _]) => !notVisible.has(k)) as [k, v]}
			<div
				class="icon"
				on:dblclick={() => {
					addInstance(k);
					$selected = null;
				}}
			>
				<img src={v.DesktopProps.icon} alt={v.DesktopProps.name} draggable="false"
				class={clickedImg === v.DesktopProps.icon ? 'clicked' : ''}
      			on:click={(event) => changeColor(event, v.DesktopProps.icon, v.DesktopProps.name)}/>
				{#if k === 'Conversation'}
					<span class="notification-badge">
						<NotificationBadge count={$unreadConversations} />
					</span>
				{:else if k === 'Contact'}
					<span class="notification-badge">
						<NotificationBadge count={$friendRequest.length} />
					</span>
				{:else if k === 'Pong'}
					<span class="notification-badge">
						<NotificationBadge count={$gameRequest.length} />
					</span>
				{/if}
				<div class="icon-text">
					<span class={clickedName === v.DesktopProps.name ? 'highlight' : ''}
					>{v.DesktopProps.name}</span>
				</div>
			</div>
		{/each}
	</div>
	{#each [...$appInstances.entries()] as [id, { componentType, component, visible, propsWin, props }] (id)}
		<Window
			{...$apps[componentType].TabProps}
			props={propsWin}
			parentWidth={width}
			parentHeight={height}
			z={$zstack.indexOf(id)}
			{visible}
			on:minimize={() => {
				visible = !visible;
				$selected = null;
			}}
			on:close={() => removeInstance(id)}
			on:mousedown={(event) => {
				event.stopPropagation();
				putOnTop(id);
				$selected = id;
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
		{#each [...$appInstances.entries()] as [id, { componentType, visible, propsWin }]}
			<Tab
				{...$apps[componentType].TabProps}
				props={propsWin}
				active={$selected === id}
				on:click={() => {
					putOnTop(id);
					if (visible && $selected === id) {
						visible = !visible;
						$selected = null;
					} else if (visible) {
						$selected = id;
					} else {
						visible = !visible;
						$selected = id;
					}
				}}
			/>
		{/each}
	</div>
	<Clock />
</nav>

<style lang="scss">
	.icons {
		position: relative;
		width: 7rem;
		height: calc(100vh - $navbar-height);
		display: flex;
		flex-direction: column;
		flex-wrap: wrap;
	}

	.icon {
		margin: 1rem;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	img {
		width: 2.4rem;
	}

	.clicked {
		filter: saturate(10%) opacity(70%);
	}

	.icon-text {
		color: white;
		margin-top: 0.19rem;
		font-size: 0.9rem;
	}

	.highlight {
		color: white;
		background-color: #1084d0;
	}

	div.desktop {
		overflow: hidden;
		height: calc(100vh - $navbar-height);
		position: relative;
	}

	@include navbar;
</style>
