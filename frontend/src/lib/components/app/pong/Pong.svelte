<script lang="ts">
	import { Context } from '$lib/components/Context.svelte';
	import DropDown from '$lib/components/drop/DropDown.svelte';
	import RightDrop from '$lib/components/drop/RightDrop.svelte';
	import DropRadios from '$lib/components/drop/DropRadios.svelte';
	import PongGame from '$lib/components/app/pong/PongGame.svelte';
	import { onDestroy } from 'svelte';

	const socket = Context.socket();
	const fetchWithToken = Context.fetchWithToken();

	let index = 0;
	let room = '';

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

	$socket.on('enter-room', (data: { room: string; index: number }) => {
		room = data.room;
		index = data.index;
		$socket.emit('enter-room', data);
		console.log('enter-room');
	});

	$socket.on('index', (i: number) => {
		index = i;
	});

	onDestroy(() => {
		$socket.off('enter-room');
		$socket.off('index');
	});
</script>

<div class="container">
	<div class="menu">
		<DropDown name="game">
			{#if matchmaking === false}
				<button on:click={matchmake}>matchmaking</button>
			{:else}
				<button class="unavailable">matchmake</button>
			{/if}
			<button class="unavailable"> invitations </button>
		</DropDown>
		<DropDown name="settings">
			<RightDrop name="scale">
				<DropRadios
					fields={['60%', '80%', '100%', '120%', '140%', '160%']}
					def="100%"
					bind:selected={scaleString}
				/>
			</RightDrop>
		</DropDown>
	</div>
	{#if room !== ''}
		<PongGame {scale} {index} {room} />
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
