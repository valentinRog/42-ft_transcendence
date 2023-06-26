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

</script>

<div id="box">
	<ul>
		<div class="pic-username-login">
			<div class="username-login">
<<<<<<< HEAD
				<li class="box">Username: {currentUser?.username || ''}</li>
				<li class="box">Registration date : {formattedDate}</li>
				<li class="box">Friends: {currentUser?.friends?.length || ''}</li>
=======
				<li class="box">Username: {$currentUser?.username || ''}</li>
				<li class="box">Registration date
					: {$currentUser?.createdAt || ''}</li>
				<li class="box">Friends: {$currentUser?.friends?.length || '0'}</li>
>>>>>>> b5ac9a29d8812870eb793e100353d0fa60a61ecc
			</div>
			<div class="pic">
				<img src={imgUrl} />
			</div>
		</div>
		{#if isUser}
			<button type="button" on:click={() => ($openEditProfile = true)}>Edit Profile</button>
		{:else if $blocks.some((block) => block.blockedId === currentUser?.id)}
			<button type="button" on:click={() => fetchUnblockUser(currentUser.id)}>UnBlock</button>
		{:else}
<<<<<<< HEAD
			<button type="button" on:click={() => fetchBlockUser(currentUser.id)}>Block</button>
=======
			{#if $blocks.some(block => block.blockedId === $currentUser?.id)}
				<button type="button" on:click={() => fetchUnblockUser($currentUser.id)}>UnBlock</button>
			{:else}
				<button type="button" on:click={() => fetchBlockUser($currentUser.id)}>Block</button>
			{/if}
>>>>>>> b5ac9a29d8812870eb793e100353d0fa60a61ecc
		{/if}
	</ul>
</div>

<style lang="scss">
	#box {
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

		.img-status {
			height: 0.8rem;
			width: auto;
		}

		button {
			@include tab-contour;
			padding: 0.5rem;
			margin: 0.25rem;
			font-size: 1rem;
		}
	}
</style>
