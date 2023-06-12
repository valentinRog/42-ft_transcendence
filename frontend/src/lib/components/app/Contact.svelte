<script lang="ts">
	import { user } from '$lib/stores';
	import { Context } from '$lib/components/Context.svelte';
	import NotificationBadge from '../NotificationBadge.svelte';

	const socket = Context.socket();

	const fetchWithToken = Context.fetchWithToken();
	const fetchFriends = Context.fetchFriends();

	const chats = Context.chats();
	const chatId = Context.chatId();
	const openChatWindow = Context.openChatWindow();
	const contacts = Context.contacts();
	const friendRequest = Context.friendRequest();
	const openFriendRequest = Context.openFriendRequest();
	const friendInfoId = Context.friendInfoId();

	let friendInput: string = '';
	let groupChatMode = false;
	let selectedFriends: string[] = [];

	fetchFriends();

	async function addFriend(event: Event) {
		const form = (event.target as HTMLFormElement).friend.value;
		const res = await fetchWithToken('notification/add-friend', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ friend: form })
		});
		await res.json();
		friendInput = '';
	}

	async function openRequest() {
		$openFriendRequest = true;
	}

	async function removeFriend(friendUsername: string) {
		const res = await fetchWithToken('users/remove-friend', {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ friend: friendUsername })
		});
		await res.json();
		fetchFriends();
	}

	function askGame(friendUsername: string) {
		fetchWithToken('notification/ask-game', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ friend: friendUsername })
		});
	}

	function toggleGroupChatMode() {
		groupChatMode = !groupChatMode;
		selectedFriends = [];
	}

	function selectFriend(event: MouseEvent) {
		const friendUsername = (event.target as HTMLInputElement).value;
		const index = selectedFriends.indexOf(friendUsername);
		if (index > -1)
			selectedFriends = [...selectedFriends.slice(0, index), ...selectedFriends.slice(index + 1)];
		else selectedFriends = [...selectedFriends, friendUsername];
	}

	async function createGroupChat() {
		selectedFriends = [$user!.username, ...selectedFriends];
		const groupName = selectedFriends.join(', ');
		let chatid: Number;
		$socket.emit('createGroupChat', {
			groupName: groupName,
			memberUsernames: selectedFriends,
			isGroupChat: true,
			accessibility: "private"
		});
		$socket.on('createChat', (chatNumber: number) => {
			$chatId = chatNumber;
			$openChatWindow = true;
		});
		toggleGroupChatMode();
	}

	function findChat(user1: string, user2: string) {
		let foundChat;

		$chats.forEach((chat) => {
			const users = chat.chatUsers.map((chatUser) => chatUser.user.username);
			if (users.includes(user1) && users.includes(user2) && chat.isGroupChat === false) {
				foundChat = chat;
			}
		});
		return foundChat;
	}

	function startChat(friend: Context.Contact) {
		let chat: any;

		if ($user) chat = findChat($user?.username, friend.username);
		$chatId = chat?.id;
		$friendInfoId = friend.id;
		$openChatWindow = true;
	}
	const addInstance = Context.addInstance();
	const selected = Context.selected();
	let visible: number = 0;
</script>

<div class="box">
	<form on:submit|preventDefault={addFriend} class="add-friend-form">
		<input type="text" name="friend" bind:value={friendInput} placeholder=" Search..." />
		<input type="submit" value="Add friend" />
	</form>
	<div class="friend-list">
		{#each $contacts as friend (friend.id)}
			<div class="friend">
				{#if groupChatMode}
					<input
						type="checkbox"
						checked={selectedFriends.includes(friend.username)}
						value={friend.username}
						on:click={selectFriend}
					/>
				{/if}
				<div
					class="name-options"
					on:mouseleave={() => {
						visible = 0;
					}}
				>
					<p
						class="username"
						on:click={() => {
							visible = visible === friend.id ? 0 : friend.id;
						}}
					>
						{friend.username}
						▾
					</p>
					<div class="buttons">
						{#if visible === friend.id}
							<img
								class="option-icons"
								src="/profile2.png"
								on:click={() => {
									addInstance('Profile', { username: friend.username }, { username: friend.id });
									$selected = null;
								}}
							/>
							{#if friend.status === 'online' || friend.status === 'in-game' || friend.status === 'spectator'}
								<img
									class="option-icons"
									src="/joystick.png"
									on:click={() => askGame(friend.username)}
								/>
							{/if}
							<img class="option-icons" src="/write.png" on:click={() => startChat(friend)} />
							<img
								class="option-icons"
								src="/no-friend.png"
								on:click={() => removeFriend(friend.username)}
							/>
						{/if}
					</div>
				</div>
				{#if friend.status === 'online'}
					<img class="status" src="/online.png" alt="online" />
				{:else if friend.username === 'vrogiste' && friend.status === 'in-game'}
					<img class="status" src="/in-game-val.png" alt="in-game" />
				{:else if friend.status === 'in-game'}
					<img class="status" src="/in-game.png" alt="in-game" />
				{:else if friend.status === 'spectator'}
					<img class="status" src="/spectator.png" alt="spectator" />
				{:else}
					<img class="status" src="/offline.png" alt="offline" />
				{/if}
			</div>
		{/each}
	</div>
	<div class="centered-buttons">
		<button on:click={toggleGroupChatMode}>{groupChatMode ? 'Cancel' : 'Create Group Chat'}</button>
		{#if groupChatMode && selectedFriends.length > 0}
			<button on:click={createGroupChat}>Confirm</button>
		{/if}
		<span class="notification-badge">
			<NotificationBadge count={$friendRequest.length} />
		</span>
		<button on:click={() => openRequest()}>Friend requests</button>
	</div>
</div>

<style lang="scss">
	.notification-badge {
		position: relative;
		top: 0.6rem;
		left: 9.4rem;
	}

	.box {
		display: flex;
		flex-direction: column;
		width: 15rem;
		height: 20rem;
		.centered-buttons {
			margin: 0.4rem 0;
			display: flex;
		}
		.add-friend-form {
			display: flex;
			justify-content: center;
			width: 100%;

			label {
				width: 100%;
				display: block;
			}
			input[type='text'] {
				@include input-text;
				width: 100%;
			}
			input[type='submit'] {
				@include input-submit;
			}
		}
	}
	.friend-list {
		flex-grow: 2;
		@include tab-border($light-grey, $dark-grey);
		margin: 0.25rem;
		.friend {
			display: flex;
			justify-content: space-between;
			white-space: nowrap;
			padding: 0.25rem;
			.status {
				height: 0.8rem;
				margin: 0.2rem 0.4rem auto auto;
			}
			.option-icons {
				margin: 0.15rem;
				height: 1.3rem;
				cursor: url($click), auto;
			}
			.username {
				margin: 0 0.25rem;
				cursor: url($click), auto;
			}
		}

		.buttons {
			display: flex;
			align-items: right;
		}

	}
	button {
		padding: 0.3rem 0.625rem;
		margin: 0 0.25rem;
		width: 100%;
		white-space: nowrap;
	}
</style>
