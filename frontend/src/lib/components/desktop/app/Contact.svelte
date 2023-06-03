<script lang="ts">
	import {
		token,
		openChatWindow,
		friendInfo,
		selected,
		contacts,
		chats,
		user,
		chatId
	} from '$lib/stores/stores';
	import type { Contact } from '$lib/stores/stores';
	import { addInstance } from '$lib/utils/appinstance';
	import { getFriends } from '$lib/utils/connect';
	import { PUBLIC_BACKEND_URL } from '$env/static/public';

	let groupChatMode = false;
	let selectedFriends: string[] = [];

	async function addFriend(event: Event) {
		const form = (event.target as HTMLFormElement).friend.value;
		const res = await fetch(`${PUBLIC_BACKEND_URL}/notification/add-friend`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${$token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ friend: form })
		});
		getFriends();
		return await res.json();
	}

	async function removeFriend(friendUsername: string) {
		const res = await fetch(`${PUBLIC_BACKEND_URL}/users/remove-friend`, {
			method: 'PATCH',
			headers: {
				Authorization: `Bearer ${$token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ friend: friendUsername })
		});
		const data = await res.json();
		getFriends();
		return data;
	}

	async function askGame(friendUsername: string) {
		const res = await fetch(`${PUBLIC_BACKEND_URL}/notification/ask-game`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${$token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ friend: friendUsername })
		});
		const data = await res.json();
		return data;
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
		const res = await fetch(`${PUBLIC_BACKEND_URL}/chat/create-chat`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${$token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				groupName: 'GROUP',
				memberUsernames: selectedFriends,
				isGroupChat: true
			})
		});
		if (res.ok) {
			let data = await res.json();

			$chatId = data.id;
			toggleGroupChatMode();
			$openChatWindow = true;
		} else console.error('Error creating group chat');
	}

	function findChat(user1: string, user2: string) {
		let foundChat;
		console.log(user1, user2);
		chats.subscribe(($chats) => {
			$chats.forEach((chat) => {
				const users = chat.chatUsers.map((chatUser) => chatUser.user.username);
				if (users.includes(user1) && users.includes(user2) && chat.isGroupChat === false) {
					foundChat = chat;
				}
			});
		});
		return foundChat;
	}

	function startChat(friend: Contact) {
		let chat: any;

		if ($user) chat = findChat($user?.username, friend.username);
		console.log(chat);
		$chatId = chat?.id;
		friendInfo.set({ id: friend.id, username: friend.username });
		$openChatWindow = true;
	}
</script>

<div id="box">
	<form on:submit|preventDefault={addFriend}>
		<label for="friend">Add Friend:</label>
		<input type="text" id="friend" name="friend" />
		<input type="submit" value="+" />
	</form>
	<button on:click={toggleGroupChatMode}>{groupChatMode ? 'Cancel' : 'Create Group Chat'}</button>
	{#if groupChatMode && selectedFriends.length > 0}
		<button on:click={createGroupChat}>Confirm</button>
	{/if}
	<div id="friend-list">
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
				<p
					on:dblclick={() => {
						addInstance('Profile', { username: friend.username }, { username: friend.id });
						$selected = null;
					}}
				>
					{friend.username}
				</p>
				<p>{friend.status}</p>
				{#if friend.status === 'online' || friend.status === 'in-game'}
					<button on:click={() => askGame(friend.username)}>Invite Game</button>
				{/if}
				<button on:click={() => startChat(friend)}>Chat</button>
				<button on:click={() => removeFriend(friend.username)}>Remove Friend</button>
			</div>
		{/each}
	</div>
</div>

<style lang="scss">
	#box {
		width: 15.5rem;
		height: 20rem;
	}

	button,
	input[type='submit'] {
		margin: 0.25rem 0 0rem 0.5rem;
		padding: 0.15rem 0.25rem;
	}

	label {
		margin: 0.5rem;
	}

	#friend {
		background-color: $light-grey;

		&:focus {
			outline: none;
		}
	}
</style>
