<script lang="ts">
	import { token } from '$lib/stores/stores';
	import { PUBLIC_BACKEND_URL } from '$env/static/public';
	import { getFriendRequest } from '$lib/components/desktop/Desktop.svelte';
	import { onMount } from 'svelte';
	import { Context } from '$lib/components/desktop/Context.svelte';

	onMount(() => {
		getFriendRequest();
	});

	async function answerFriendRequest(friendUsername: string, response: boolean) {
		const res = await fetch(`${PUBLIC_BACKEND_URL}/notification/friend-response`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${$token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ friend: friendUsername, response: response })
		});
		const ret = await res.json();
		getFriendRequest();
	}

	const friendRequest = Context.friendRequest();
</script>

<div id="box">
	<div id="friend-list">
		{#each $friendRequest as request (request.id)}
			<div class="friend">
				<p>{request.sender}</p>
				<button on:click={() => answerFriendRequest(request.sender, true)}>Accept</button>
				<button on:click={() => answerFriendRequest(request.sender, false)}>Refuse</button>
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
