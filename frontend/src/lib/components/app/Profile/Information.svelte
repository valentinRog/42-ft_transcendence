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
	const friends = Context.contacts();
	const addInstance = Context.addInstance();
	const selected = Context.selected();
	const askGame = Context.askGame();
	const startChat = Context.startChat();

	export let userId: number | null = null;

	let currentUser = writable<User>();
	let imgUrl: string | '';
	let isUser = false;

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

	const createdAt = $user?.createdAt;

	const formattedDate = new Date(createdAt).toLocaleDateString('en', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric'
	});

	$: {
		if (userId === null) {
			currentUser.set($user);
			fetchAvatar();
		}
	}

	(async () => {
		if (userId === null) {
			isUser = true;
			await fetchMe();
		} else {
			fetchWithToken(`users/info/${userId}`)
				.then((res) => res.json())
				.then((data) => {
					currentUser.set(data);
					fetchAvatar();
				});
		}
	})();

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
								<li
									class="friend"
									on:dblclick={() => {
										addInstance('Profile', { userId: friend.id }, { userId: friend.id });
										$selected = null;
									}}
								>
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
			<button class="button-alone" type="button" on:click={() => ($openEditProfile = true)}>Edit Profile</button>
		{:else if $blocks.some((block) => block.blockedId === currentUser?.id)}
			<button class="button-alone" type="button" on:click={() => fetchUnblockUser(currentUser.id)}>UnBlock</button>
		{:else if $blocks.some((block) => block.blockedId === $currentUser?.id)}
			<button class="button-alone" type="button" on:click={() => fetchUnblockUser($currentUser.id)}>UnBlock</button>
		{:else}
			<div class="buttons">
				<button type="button" on:click={() => startChat($currentUser)}>Open chat</button>
				<button type="button" on:click={() => askGame($currentUser.id)}>Ask game</button>
				<button type="button" on:click={() => fetchBlockUser($currentUser.id)}>Block</button>
			</div>
		{/if}
	</ul>
</div>

<style lang="scss">
	#box {
		.whole-box {
			height: 20rem;
			display: flex;
			flex-direction: column;
		}
		.pic-username-login {
			display: flex;
			align-items: flex-start;
			justify-content: space-between;
			width: 22rem;

			.pic {
				width: 7rem;
				height: 5.5rem;
				@include tab-contour-hollow;
				background-color: white;
				display: flex;
				justify-content: center;
				align-items: center;
				overflow: hidden;
				img {
					position: center;
					height: 5rem;
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
			max-height: 8.8rem;
			overflow-y: auto;
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

		.button-alone {
			@include button-95;

			width: 7rem;
			margin-left: auto;
			margin-right: auto;
			padding: 0.5rem;
			font-size: 1rem;
			position: absolute;
			top: 90%;
			left: 50%;
			transform: translate(-50%, -50%);
		}

		.buttons {
			display: flex;
			position: absolute;
			flex-direction: row;
			align-items: center;
			bottom: 0.4rem;
			button {
				@include button-95;
				margin: 0.2rem;
				width: 7rem;
				padding: 0.5rem;
				font-size: 1rem;
			}
		}
	}
</style>
