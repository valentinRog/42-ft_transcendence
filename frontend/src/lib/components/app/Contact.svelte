<script lang="ts">
	import { user } from '$lib/stores';
	import { onMount } from 'svelte';
	import type { Socket } from 'socket.io-client';
	import { Context } from '$lib/components/Context.svelte';

	const socket = Context.socket();

	const fetchWithToken = Context.fetchWithToken();
	const fetchFriends = Context.fetchFriends();

	const chats = Context.chats();
	const chatId = Context.chatId();
	const openChatWindow = Context.openChatWindow();
	const contacts = Context.contacts();
	const friendRequest = Context.friendRequest();
	const openFriendRequest = Context.openFriendRequest();
	const friendInfo = Context.friendInfo();

	let groupChatMode = false;
	let selectedFriends: string[] = [];
	let socketInstance: Socket | null = null;

	onMount(() => {
		socket.subscribe(($socket) => {
			socketInstance = $socket;
		});
	});

	async function addFriend(event: Event) {
		const form = (event.target as HTMLFormElement).friend.value;
		const res = await fetchWithToken('users/add-friend', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ friend: form })
		});
		await res.json();
		fetchFriends();
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
		if (socketInstance) {
			socketInstance.emit('createGroupChat', {
				groupName: groupName,
				memberUsernames: selectedFriends,
				isGroupChat: true
			});
			socketInstance.on('createChat', (chatNumber: number) => {
				$chatId = chatNumber;
				$openChatWindow = true;
			});
		}
		toggleGroupChatMode();
	}

	function findChat(user1: string, user2: string) {
		let foundChat;
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

	function startChat(friend: Context.Contact) {
		let chat: any;

		if ($user) chat = findChat($user?.username, friend.username);
		$chatId = chat?.id;
		friendInfo.set({ id: friend.id, username: friend.username });
		$openChatWindow = true;
	}

	const addInstance = Context.addInstance();
	const selected = Context.selected();
</script>

<div id="box">
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta2/css/all.min.css">
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <form on:submit|preventDefault={addFriend} id="add-friend-form">
        <label for="friend">Add Friend: </label>
        <input type="text" id="friend" name="friend" />
        <input type="submit" value="+" />
    </form>
    <div id="centered-buttons">
        <button on:click={toggleGroupChatMode}>{groupChatMode ? 'Cancel' : 'Create Group Chat'}</button>
        {#if groupChatMode && selectedFriends.length > 0}
            <button on:click={createGroupChat}>Confirm</button>
        {/if}
		<button on:click={() => openRequest()}>Friend requests</button>
    </div>
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
                <span class="status-dot {friend.status === 'online' || friend.status === 'in-game' || friend.status === 'spectator' ? 'online' : 'offline'}"></span>
                <p
                    on:dblclick={() => {
                        addInstance('Profile', { username: friend.username }, { username: friend.id });
                        $selected = null;
                    }}
                    class="username"
                >
                    {friend.username}
                </p>
                <div class="buttons">
                    {#if friend.status === 'online' || friend.status === 'in-game' || friend.status === 'spectator'}
						<i class="fas fa-gamepad" on:click={() => askGame(friend.username)}></i>
                    {/if}
                    <i class="fas fa-comments" on:click={() => startChat(friend)}></i>
                    <i class="fas fa-user-times" on:click={() => removeFriend(friend.username)}></i>
                </div>
				<!-- <div class="buttons">
					{#if friend.status === 'online' || friend.status === 'in-game' || friend.status === 'spectator'}
						<i class="fa fa-gamepad" on:click={() => askGame(friend.username)}></i>
					{/if}
					<i class="fa fa-comments" on:click={() => startChat(friend)}></i>
					<i class="fa fa-times-circle" on:click={() => removeFriend(friend.username)}></i>
				</div>-->
            </div>
        {/each}
    </div>
</div>


<style lang="scss">

	body {
		font-family: Arial, sans-serif;
	}

	#box {
		width: 15rem;
		height: 20rem;
		flex-direction: column;
		align-items: center;
	}

	#add-friend-form, #centered-buttons {
		display: flex;
		justify-content: center;
		width: 100%;
		margin-top: 0.5rem;
		margin-bottom: 1rem;
	}

	.friend {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.625rem;
		border: 1px solid #ccc;
	}

	.status-dot {
		width: 0.625rem;
		height: 0.625rem;
		border-radius: 50%;
		margin-right: 0.625rem;
	}

	.online {
		background: green;
	}

	.offline {
		background: red;
	}

	.buttons {
		display: flex;
		align-items: right;
	}

	button {
		padding: 0.3rem 0.625rem;;
	}

	.buttons i {
		cursor: pointer;
		margin-left: 0.625rem;
		padding: 0.3rem;;
		border-radius: 2px;
		background-color: #f8f8f8;
		transition: background-color 0.3s ease;
	}

	.buttons i:hover {
		background-color: #c4c4c4;
	}

</style>
