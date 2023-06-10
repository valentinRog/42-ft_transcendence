<script lang="ts">
	import { user } from '$lib/stores';
	import { Context } from '$lib/components/Context.svelte';

	const fetchWithToken = Context.fetchWithToken();

	export let username: string | null | undefined = null;
	let login: string | null | undefined = null;
	let currentUser: any = {};
	let imgUrl: string | '';

	if (username === null) {
		username = $user!.username;
		login = $user!.login;
		currentUser = $user;
	} else {
		fetchWithToken(`users/info/${username}`)
			.then((res) => res.json())
			.then((data) => {
				currentUser = data;
				login = currentUser.login;
			});
	}

	const friends = Context.contacts();

	$: if (login)
		fetchWithToken(`users/avatar/${login}`)
			.then((res) => res.blob())
			.then((blob) => (imgUrl = URL.createObjectURL(blob)));
</script>

<div id="box">
	<ul>
		<div class="pic-username-login">
			<div class="username-login">
				<li class="box">Username: {currentUser.username || ''}</li>
				<li class="box">Login: {currentUser.login || ''}</li>
			</div>
			<li class="pic">
				<img class="profile-pic" src={imgUrl} alt="profile picture" />
			</li>
		</div>
		{#if username === $user?.username}
			<li class="box friends">
				<p>My friends</p>
				<ul id="friend-list">
					{#each $friends as friend (friend.id)}
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
					height: 4.5rem;
					width: auto;
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
