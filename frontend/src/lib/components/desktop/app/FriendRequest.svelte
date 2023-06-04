<script lang="ts">
	import { token, friendInfo, selected, contacts, user } from '$lib/stores/stores';
	import { addInstance } from '$lib/utils/appinstance';
	import { PUBLIC_BACKEND_URL } from '$env/static/public';

	async function acceptFriendRequest(friendUsername: string) {
	  const res = await fetch(`${PUBLIC_BACKEND_URL}/notification/accept-friend-request`, {
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

	async function refuseFriendRequest(friendUsername: string) {
	  const res = await fetch(`${PUBLIC_BACKEND_URL}/notification/refuse-friend-request`, {
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

  </script>

  <div id="box">
	<div id="friend-list">
	  {#each $contacts as request (request.id)}
		  <div class="friend">
			<p>{request.username}</p>
			<button on:click={() => acceptFriendRequest(request.username)}>Accept</button>
			<button on:click={() => refuseFriendRequest(request.username)}>Refuse</button>
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
