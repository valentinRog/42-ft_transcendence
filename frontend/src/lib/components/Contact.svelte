<script lang="ts">
	import { token, openChatWindow, friendInfo, selected, contacts} from '$lib/stores/stores';
	import { addInstance } from '$lib/scripts/appinstance';
	import { getFriends } from '$lib/scripts/connect';

	interface Friend {
		id: number;
		username: string;
		status: string;
	}

	let groupChatMode = false;
	let selectedFriends: string[] = [];

	async function addFriend(event: Event) {
		const form = (event.target as HTMLFormElement).friend.value;
		const res = await fetch('http://localhost:3000/users/add-friend', {
			method: 'PATCH',
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
		const res = await fetch('http://localhost:3000/users/remove-friend', {
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

	function startChat(friend: Friend) {
		$openChatWindow = true;
		friendInfo.set({ id: friend.id, username: friend.username });
	}

	async function askGame(friendUsername: string) {
		const res = await fetch('http://localhost:3000/notification/ask-game', {
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
    	else
        	selectedFriends = [...selectedFriends, friendUsername];
	}

	async function createGroupChat() {
		console.log(selectedFriends);

		toggleGroupChatMode();
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
					<input	type="checkbox"
							checked={selectedFriends.includes(friend.username)}
							value={friend.username}
							on:click={selectFriend}
					/>
				{/if}
				<p
					on:dblclick={() => {
						addInstance('Profile', { username: friend.username }, {username: friend.id});
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
