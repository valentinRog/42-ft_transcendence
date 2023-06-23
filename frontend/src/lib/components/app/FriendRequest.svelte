<script lang="ts">
	import { Context } from '$lib/components/Context.svelte';

	const fetchWithToken = Context.fetchWithToken();
	const fetchFriendRequest = Context.fetchFriendRequest();
	const fetchFriends = Context.fetchFriends();

	async function answerFriendRequest(friendUsername: string, response: boolean) {
		const res = await fetchWithToken('notification/friend-response', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ friend: friendUsername, response: response })
		});
		await res.json();
		fetchFriendRequest();
		fetchFriends();
	}

	const friendRequest = Context.friendRequest();
	fetchFriendRequest();
</script>

<div id="box">
	<div id="friend-list">
		{#each $friendRequest as request (request.id)}
			<div class="friend">
				<p>{request.senderName}</p>
				<button on:click={() => answerFriendRequest(request.senderName, true)}>Accept</button>
				<button on:click={() => answerFriendRequest(request.senderName, false)}>Refuse</button>
			</div>
		{/each}
	</div>
</div>

<style lang="scss">
	#box {
		width: 15.5rem;
		height: 20rem;
	}

	button {
		margin: 0.25rem 0 0rem 0.5rem;
		padding: 0.15rem 0.25rem;
	}
</style>
