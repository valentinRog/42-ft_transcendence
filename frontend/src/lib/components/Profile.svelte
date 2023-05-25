<script lang="ts">
	import { token, user } from '$lib/stores/stores';
	import { construct_svelte_component } from 'svelte/internal';

	//display friend, copied from contact mais ca pourrait etre une fonction partagee non ?
	interface Friend {
		id: string;
		username: string;
		status: string;
	}

	let currentUser: {} | null;
	let friends: Friend[] = [];

	async function getUserById() {
		const res = await fetch('http://38.242.214.243:3000/users/info/5', {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${$token}`
			}
		});
		const data = await res.json();
		console.log(data);
		return data;
	}

	async function getFriends() {
		const res = await fetch('http://38.242.214.243:3000/users/me/friends', {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${$token}`
			}
		});
		const data = await res.json();
		friends = data || [];
		return data;
	}
	getFriends();
	getUserById();
</script>

<div id="box">
	<ul>
		<li class="box">Username: {$user?.username}</li>
		<li class="box">Login: {$user?.login}</li>
		<li class="box friends">
			<p>My friends</p>
			<ul id="friend-list">
				{#each friends as friend (friend.id)}
					<li class="friend">
						<div>
							<p>{friend.username} :</p>
							<p class="status">{friend.status}</p>
							{#if friend.status === 'online'}
								<img class="img-status" src="/happy.png" alt="online" />
							{:else if friend.username === 'vrogiste' && friend.status === 'in-game'}
								<img class="img-status" src="/focused-val.png" alt="in-game" />
							{:else if friend.status === 'in-game'}
								<img class="img-status" src="/focused3.png" alt="in-game" />
							{:else}
								<img class="img-status" src="/sad.png" alt="offline" />
							{/if}
						</div>
					</li>
				{/each}
			</ul>
		</li>
	</ul>
</div>

<style lang="scss">
	#box {
		width: 20rem;
		height: 20rem;
		li {
			list-style: none;
		}
		li.box {
			padding: 0.5rem;
			margin: 0.25rem;
			@include tab-contour-hollow;
		}
		li.friends {
			@include tab-contour-hollow;
			background-color: white;
			div {
				display: flex;
				align-items: center;
				.status {
					margin-left: auto;
				}
				img {
					padding-left: 0.5rem;
				}
			}
		}
		.img-status {
			height: 0.75rem;
			width: auto;
		}
	}
</style>
