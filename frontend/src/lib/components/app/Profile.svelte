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

	if (login) {
		fetchWithToken(`users/avatar/${login}`)
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


	let fileinput : HTMLInputElement;

	const onFileSelected = (e : any)=>{
		let image = e.target.files[0];
		const formData = new FormData();
        formData.append('file', image);

		fetchWithToken('users/upload', {
			method: 'POST',
			body: formData
		})
		.then((res) => res.json())
			.then((data) => {
				imgUrl = URL.createObjectURL(image);
			});
	}

	import { onMount } from 'svelte';

	let activeTabIndex = 0;
	const tabContents = [
		"Desktop content",
		"My computer content",
		"Control panel content",
		"Devices manager content",
		"Hardware profiles content",
		"Performance content"
	];

	function activateTab(index) {
		activeTabIndex = index;
	}

	onMount(() => {
		// Set the initial tab as active on component mount
		activateTab(activeTabIndex);
	});

</script>

<div class="window-body">
	<p>Hello, world!</p>

	<menu role="tablist">
	  {#each tabContents as content, index}
		<li role="tab" aria-selected={index === activeTabIndex} on:click={() => activateTab(index)}>
		  <a href="#tabs">{content}</a>
		</li>
	  {/each}
	</menu>

	<div class="window" role="tabpanel">
	  <div class="window-body">
		{#each tabContents as content, index}
		  {#if index === activeTabIndex}
			<p class="tab-content">{content}</p>
		  {/if}
		{/each}
	  </div>
	</div>
  </div>

<!--<div id="box">
	<ul>
		<div class="pic-username-login">
			<div class="username-login">
				<li class="box">Username: {currentUser.username || ''}</li>
				<li class="box">Login: {currentUser.login || ''}</li>
			</div>
			<li class="pic">
				<input type="file" id="file-upload" accept=".jpg, .jpeg, .png" on:change={(e)=>onFileSelected(e)} bind:this={fileinput}>
				<img src={imgUrl}>
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
</div>-->

<style lang="scss">

	@include onglet;

	//#box {
	//	width: 20rem;
	//	height: 20rem;
	//	.pic-username-login {
	//		display: flex;
	//		align-items: center;
	//		.pic {
	//			display: inline-block;
	//			position: relative;
	//			cursor: pointer;

	//			@include tab-contour-hollow;
	//			padding: 0.15rem;
	//			margin-right: 0.25rem;
	//			margin-left: auto;
	//			background-color: white;
	//			height: 5rem;
	//			width: 7.5rem;
	//			display: flex;
	//			img {
	//				margin: 0 auto;
	//				height: 4.5rem;
	//				width: auto;
	//			}

	//			input[type="file"] {
	//				position: absolute;
	//				top: 0;
	//				left: 0;
	//				opacity: 0;
	//				cursor: pointer;
	//				width: 100%;
	//				height: 100%;
	//			}
	//		}
	//	}
	//	li {
	//		list-style: none;
	//	}
	//	li.box {
	//		padding: 0.5rem;
	//		margin: 0.25rem;
	//		@include tab-contour-hollow;
	//	}
	//	li.friends {
	//		@include tab-contour-hollow;
	//		background-color: white;
	//		div {
	//			margin-bottom: 0.2rem;
	//			display: flex;
	//			align-items: center;
	//			.status {
	//				margin-left: auto;
	//			}
	//			img {
	//				padding-left: 0.5rem;
	//			}
	//		}
	//	}
	//	.img-status {
	//		height: 0.8rem;
	//		width: auto;
	//	}
	//}
</style>
