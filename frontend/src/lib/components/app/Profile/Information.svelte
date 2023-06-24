<script lang="ts">
	import { user } from '$lib/stores';
	import { Context } from '$lib/components/Context.svelte';

	const fetchWithToken = Context.fetchWithToken();
	const fetchBlockUser = Context.fetchBlockUser();
	const fetchUnblockUser = Context.fetchUnblockUser();
	const openEditProfile = Context.openEditProfile();

	const blocks = Context.blocks();

	export let userId: string | null | undefined = null;

	let currentUser: any = {};
	let imgUrl: string | '';
	let isUser = false;
	let showEdit = false;

	$: {
		if (userId === null) {
			currentUser = $user;
			fetchAvatar();
			showEdit = true;
		} else {
			fetchWithToken(`users/info/${userId}`)
				.then((res) => res.json())
				.then((data) => {
					currentUser = data;
					fetchAvatar();
				});
		}
	}

	const friends = Context.contacts();

	async function fetchAvatar() {
		fetchWithToken(`users/avatar/${currentUser.id}`)
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
</script>

<div id="box">
	<ul>
		<div class="pic-username-login">
			<div class="username-login">
				<li class="box">Username: {currentUser.username || ''}</li>
				<li class="box">Login: {currentUser.login || ''}</li>
			</div>
			<li class="pic">
				<img src={imgUrl} />
			</li>
		</div>
		{#if isUser}
			<button type="button" on:click={() => ($openEditProfile = true)}>Edit Profile</button>
		{:else}
			{#if $blocks.some(block => block.blockedId === currentUser.id)}
				<button type="button" on:click={() => fetchUnblockUser(currentUser.id)}>UnBlock</button>
			{:else}
				<button type="button" on:click={() => fetchBlockUser(currentUser.id)}>Block</button>
			{/if}
		{/if}
		{#if userId === $user?.id}
			<li class="box friends">
				<p>My friends</p>
				<ul id="friend-list">
					{#each $friends as friend (friend.id)}
						<li class="friend">
							<div>
								<p>{friend.username} :</p>
								<p class="status">{friend.status}</p>
								{#if friend.status === 'online'}
									<img class="img-status" src="/online.png" alt="online" />
								{:else if friend.username === 'vrogiste' && friend.status === 'in-game'}
									<img class="img-status" src="/in-game-val.png" alt="in-game" />
								{:else if friend.status === 'in-game'}
									<img class="img-status" src="/in-game.png" alt="in-game" />
								{:else if friend.status === 'spectator'}
									<img class="img-status" src="/spectator.png" alt="spectator" />
								{:else}
									<img class="img-status" src="/offline.png" alt="offline" />
								{/if}
							</div>
						</li>
					{/each}
				</ul>
			</li>
		{/if}
	</ul>
</div>

<style lang="scss">
	#box {
		width: 20rem;
		height: 20rem;
		.pic-username-login {
			display: flex;
			align-items: center;
			.pic {
				display: inline-block;
				position: relative;

				@include tab-contour-hollow;
				padding: 0.15rem;
				margin-right: 0.25rem;
				margin-left: auto;
				background-color: white;
				height: 5rem;
				width: 7.5rem;
				display: flex;
				img {
					margin: 0 auto;
				}
			}
		}
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
				margin-bottom: 0.2rem;
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
			height: 0.8rem;
			width: auto;
		}
	}
</style>
