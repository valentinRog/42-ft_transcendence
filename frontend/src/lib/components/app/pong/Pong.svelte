<script lang="ts">
	import { Context } from '$lib/components/Context.svelte';
	import DropDown from '$lib/components/drop/DropDown.svelte';
	import RightDrop from '$lib/components/drop/RightDrop.svelte';
	import DropRadios from '$lib/components/drop/DropRadios.svelte';
	import DropCheck from '$lib/components/drop/DropCheck.svelte';
	import PongGame from '$lib/components/app/pong/PongGame.svelte';
	import { writable } from 'svelte/store';

	const socket = Context.socket();
	const fetchWithToken = Context.fetchWithToken();
	const gameRequest = Context.gameRequest();
	const fetchSettings = Context.fetchSettings();
	const addInstance = Context.addInstance();
	const matchmaking = Context.matchmaking();
	const room = Context.room();
	const settings = Context.settings();

	fetchSettings();

	let scale = 1;

	let scaleString: string;
	$: if (scaleString !== undefined) {
		scale = parseInt(scaleString) / 100;
	}

	function matchmake() {
		if ($matchmaking) return;
		$matchmaking = true;
		fetchWithToken('matchmaking/queue', {
			method: 'POST'
		});
	}

	function responseGame(senderId: number, accept: boolean) {
		$gameRequest = $gameRequest.filter((x) => x.senderId !== senderId);
		$socket.emit('response-game', { response: accept, friendId: senderId });
	}

	let selected = writable(
		new Map<string, boolean>(
			Object.entries({
				names: true,
				rating: true,
				performances: true
			})
		)
	);
</script>

<div class="container">
	<div class="menu">
		<DropDown name="game" notif={$gameRequest.length}>
			{#if $matchmaking === false}
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
			<RightDrop name="show">
				<DropCheck fields={selected} />
			</RightDrop>
			<RightDrop name="colors">
				<div class="color">
					background <input type="color" bind:value={$settings.pong.colors.background} />
				</div>
				<div class="color">
					paddle <input type="color" bind:value={$settings.pong.colors.paddle} />
				</div>
				<div class="color">
					ball <input type="color" bind:value={$settings.pong.colors.ball} />
				</div>
				<div class="color">
					score <input type="color" bind:value={$settings.pong.colors.score} />
				</div>
				<div class="color">
					decorations <input type="color" bind:value={$settings.pong.colors.decorations} />
				</div>
			</RightDrop>
			<button on:click={() => addInstance('PongKeybinds')}>keybinds</button>
		</DropDown>
	</div>
	{#if $room !== null}
		<PongGame {scale} show={$selected} />
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

		div.color {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 1rem;
			@include dropdown-button;

			input[type='color'] {
				height: 1.3rem;
			}
		}
	}
</style>
