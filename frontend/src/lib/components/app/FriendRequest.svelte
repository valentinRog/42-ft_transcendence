<script lang="ts">
	import { Context } from '$lib/components/Context.svelte';
	import { writable } from 'svelte/store';

	const fetchWithToken = Context.fetchWithToken();
	const fetchFriendRequest = Context.fetchFriendRequest();
	const fetchFriends = Context.fetchFriends();
	const fetchMe = Context.fetchMe();
	const addInstance = Context.addInstance();

	let currentRequest: Context.NotifRequest | null = null;

	async function answerFriendRequest(friendUsername: string | undefined, response: boolean) {
		if (friendUsername === undefined) return;
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
		fetchMe();
	}

	function checkProfile (userId: number | undefined) {
		if (userId === undefined) return;
		addInstance('Profile', {}, { userId: userId });
	}

	const friendRequest = Context.friendRequest();
	fetchFriendRequest();

</script>

<div id="box">
	{#if $friendRequest?.length === 0}
		<tr>
			<td colspan="3">You don't have any friend request</td>
		</tr>
	{:else}
	<div class="panel">
			<table class="interactive">
				<thead>
					<tr>
						<th>Username</th>
					</tr>
				</thead>
				<tbody>
					{#each $friendRequest as request}
						<tr
								class={currentRequest === request ? 'highlighted' : ''}
								on:click={() => (currentRequest = request)}
							>
							<td>{request.senderName}</td>
						</tr>
					{/each}
				</tbody>
			</table>
	</div>
			<button on:click={() => answerFriendRequest(currentRequest?.senderName, true)}>Accept</button>
			<button on:click={() => answerFriendRequest(currentRequest?.senderName, false)}>Refuse</button>
			<button on:click={() => checkProfile(currentRequest?.senderId) }>Check Profile</button>
	{/if}
</div>

<style lang="scss">

	#box {
		width: 13.3rem;
		height: 17rem;
	}

	.panel {
		height: 90%;
	}

	@include table-95;

	button {
		@include button-95;
		padding: 0.3rem 0.6rem;
		white-space: nowrap;
	}
</style>
