<script lang="ts">
	import { user } from '$lib/stores';
	import type { User } from '$lib/stores';
	import { Context } from '$lib/components/Context.svelte';
	import { writable } from 'svelte/store';

	const fetchWithToken = Context.fetchWithToken();
	const fetchMe = Context.fetchMe();
	const fetchBlockUser = Context.fetchBlockUser();
	const fetchUnblockUser = Context.fetchUnblockUser();
	const openEditProfile = Context.openEditProfile();

	const blocks = Context.blocks();

	export let userId: number | null | undefined = null;

	let currentUser = writable<User>();

	let imgUrl: string | '';
	let isUser = false;

	$: {
		if (userId === null) {
			currentUser.set($user);
		}
	}

	async function fetchAvatar() {
		fetchWithToken(`users/avatar/${$currentUser?.id}`)
			.then((res) => {
				if (res.status === 200 || res.status === 201) {
					return res.blob();
				} else {
					throw new Error('Avatar fetch failed');
				}
			})
			.then((blob) => (imgUrl = URL.createObjectURL(blob)))
			.catch(() => {
				imgUrl = '/avatar.png';
			});
	}

	const createdAt = $user.createdAt;

	const formattedDate = new Date(createdAt).toLocaleDateString('en', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric'
	});
	(async () => {
		if (userId === null) {
			isUser = true;
			await fetchMe();
			await fetchAvatar();
		} else {
			fetchWithToken(`users/info/${userId}`)
				.then((res) => res.json())
				.then((data) => {
					currentUser.set(data);
					fetchAvatar();
				});
		}
	})();
	const friends = Context.contacts();
</script>

<div id="box">
	<ul class="whole-box">
		<div class="pic-username-login">
			<div class="username-login">
				<li class="box">Username : {$currentUser?.username || ''}</li>
				<li class="box">Registration date : {formattedDate || ''}</li>
				<li class="friend-list">
					Friends : {$currentUser?.friends?.length || '0'}
					{#if $currentUser?.id === $user?.id}
						<ul>
							{#each $friends as friend (friend.id)}
								<li class="friend">
									<p>{friend.username}</p>
									<div class="status-img">
										<p class="status">{friend.status}</p>
										{#if friend.status === 'online'}
											<img src="/online.png" alt="online" />
										{:else if friend.username === 'vrogiste' && friend.status === 'in-game'}
											<img src="/in-game-val.png" alt="in-game" />
										{:else if friend.status === 'in-game'}
											<img src="/in-game.png" alt="in-game" />
										{:else if friend.status === 'spectator'}
											<img src="/spectator.png" alt="spectator" />
										{:else}
											<img src="/offline.png" alt="offline" />
										{/if}
									</div>
								</li>
							{/each}
						</ul>
					{/if}
				</li>
			</div>
			<div class="pic">
				<img src={imgUrl} />
			</div>
		</div>
		{#if isUser}
			<button type="button" on:click={() => ($openEditProfile = true)}>Edit Profile</button>
		{:else if $blocks.some((block) => block.blockedId === currentUser?.id)}
			<button type="button" on:click={() => fetchUnblockUser(currentUser.id)}>UnBlock</button>
		{:else if $blocks.some((block) => block.blockedId === $currentUser?.id)}
			<button type="button" on:click={() => fetchUnblockUser($currentUser.id)}>UnBlock</button>
		{:else}
			<button type="button" on:click={() => fetchBlockUser($currentUser.id)}>Block</button>
		{/if}
	</ul>
</div>

<style lang="scss">
	#box {
		.whole-box {
			height: 18rem;
			display: flex;
			flex-direction: column;
		}
		.pic-username-login {
			display: flex;
			align-items: flex-start;
			justify-content: space-between;
			width: 22rem;
			.pic {
				@include tab-contour-hollow;
				padding: 0.15rem;
				margin-bottom: 0.25rem;
				background-color: white;
				height: 6rem;
				width: 7rem;
				display: flex;
				img {
					margin: 0 auto;
				}
			}
			.username-login {
				width: 12rem;
			}
		}
		li {
			list-style: none;
		}
		li.box {
			padding: 0.5rem;
			margin-bottom: 0.25rem;
			@include tab-contour-hollow;
		}
		.friend-list {
			padding: 0.5rem;
			@include tab-contour-hollow;
			background-color: white;
			.friend {
				display: flex;
				justify-content: space-between;
				align-items: center;
				width: 15;
				.status-img {
					margin-bottom: 0.2rem;
					display: flex;
					align-items: center;
					align-self: flex-end;
					margin-left: auto;
					img {
						padding-left: 0.5rem;
						height: 0.9rem;
						width: auto;
					}
				}
			}
		}

		.img-status {
			height: 0.8rem;
			width: auto;
		}

		button {
			@include button-95;

			width: 7rem;
			margin-left: auto;
			margin-right: auto;
			padding: 0.5rem;
			font-size: 1rem;
			margin-top: auto;
		}
	}
</style>
