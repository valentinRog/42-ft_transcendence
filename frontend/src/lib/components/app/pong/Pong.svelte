<script lang="ts">
	import { Context } from '$lib/components/Context.svelte';
	import DropDown from '$lib/components/drop/DropDown.svelte';
	import RightDrop from '$lib/components/drop/RightDrop.svelte';
	import DropRadios from '$lib/components/drop/DropRadios.svelte';
	import PongGame from '$lib/components/app/pong/PongGame.svelte';
	import { onDestroy } from 'svelte';

	const socket = Context.socket();
	const fetchWithToken = Context.fetchWithToken();
	const gameRequest = Context.gameRequest();
	const fetchSettings = Context.fetchSettings();
	const addInstance = Context.addInstance();

	fetchSettings();

	let index = 0;
	let room = '';
	let opponent = '';

	let scale = 1;

	let scaleString: string;
	$: if (scaleString !== undefined) {
		scale = parseInt(scaleString) / 100;
	}

	let matchmaking = false;
	function matchmake() {
		matchmaking = true;
		fetchWithToken('matchmaking/queue', {
			method: 'POST'
		});
	}

	$socket.on('enter-room', (data: { room: string; index: number; opponent: string }) => {
		room = data.room;
		index = data.index;
		opponent = data.opponent;
		$socket.emit('enter-room', data);
	});

	$socket.on('index', (i: number) => {
		index = i;
	});

	onDestroy(() => {
		$socket.off('enter-room');
		$socket.off('index');
	});

	function responseGame(senderId: number, accept: boolean) {
		$gameRequest = $gameRequest.filter((x) => x.senderId !== senderId);
		$socket.emit('response-game', { response: accept, friend: senderId });
	}
</script>

<div class="container">
	<div class="menu">
		<DropDown name="game" notif={$gameRequest.length}>
			{#if matchmaking === false}
				<button on:click={matchmake}>matchmaking</button>
			{:else}
				<button class="unavailable">matchmake</button>
			{/if}
			{#if $gameRequest.length > 0}
				<RightDrop name="invitations" notif={$gameRequest.length}>
					{#each $gameRequest as r (r.id)}
						<RightDrop name={r.senderName}>
							<button on:click={() => responseGame(r.senderId, true)}>accept</button>
							<button on:click={() => responseGame(r.senderId, false)}>decline</button>
						</RightDrop>
					{/each}
				</RightDrop>
			{:else}
				<button class="unavailable"> invitations </button>
			{/if}
		</DropDown>
		<DropDown name="settings">
			<RightDrop name="scale">
				<DropRadios
					fields={['60%', '80%', '100%', '120%', '140%', '160%']}
					def="100%"
					bind:selected={scaleString}
				/>
			</RightDrop>
			<button on:click={() => addInstance('PongKeybinds')}>keybinds</button>
		</DropDown>
	</div>
	{#if room !== ''}
		<PongGame {scale} {index} {room} {opponent} />
	{:else}
		<div class="empty-background">
			<div>
				<div class="smiley">
					<img src="offline.png" />
				</div>
				<p>Sorry, no game at the moment.</p>
			</div>
		</div>
	{/if}
</div>

<style lang="scss">
	div.container {
		padding: 0.2rem;

		div.menu {
			height: 1.5rem;
			@include tab-border(white, $dark-grey);
			display: flex;
			button:not(.unavailable) {
				@include dropdown-button;
			}

			button.unavailable {
				@include dropdown-button(false);
			}
		}
		.empty-background {
			margin: 0.2rem 0;
			width: 30rem;
			height: 20rem;
			@include tab-border(white, $dark-grey);
			display: flex;
			align-items: center;
			justify-content: center;
			div {
				@include tab-border(white, $dark-grey);
				width: 15rem;
				height: 8rem;
				display: flex;
				align-items: center;
				justify-content: center;
				flex-direction: column;
				.smiley {
					height: fit-content;
					width: fit-content;
					@include tab-border;
					img {
						height: 2rem;
						width: 2rem;
						padding: 0.3rem;
						@include tab-border($dark-grey, $light-grey);
					}
				}
				p {
					margin: 0.5rem;
				}
			}
		}
	}
</style>
