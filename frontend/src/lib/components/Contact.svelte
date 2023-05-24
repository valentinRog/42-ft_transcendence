<script lang="ts">
	import { token, openChatWindow, chatRecipient, selected } from '$lib/stores/stores';
	import { addInstance } from '$lib/scripts/appinstance';

	interface Friend {
		id: string;
		username: string;
		status: string;
	}

	let friends: Friend[] = [];

	async function addFriend(event: Event) {
		const form = (event.target as HTMLFormElement).friend.value;
		console.log(form);
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

	async function getFriends() {
		const res = await fetch('http://localhost:3000/users/me/friends', {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${$token}`
			}
		});
		const data = await res.json();
		friends = data || [];
		return data;
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

	function startChat(friendUsername: string) {
		$openChatWindow = true;
		chatRecipient.set(friendUsername);
	}

	getFriends();
</script>

<div id="box">
	<form on:submit|preventDefault={addFriend}>
		<label for="friend">Add Friend:</label>
		<input type="text" id="friend" name="friend" />
		<input type="submit" value="+" />
	</form>
	<div id="friend-list">
		{#each friends as friend (friend.id)}
			<div class="friend">
				<p on:dblclick={() => { addInstance('Contact', {username: friend.username}); $selected = null;} }>{friend.username}</p>
				<p>{friend.status}</p>
				{#if friend.status === 'online'}
					<button>Invite Game</button>
				{/if}
				<button on:click={() => startChat(friend.username)}>Chat</button>
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
