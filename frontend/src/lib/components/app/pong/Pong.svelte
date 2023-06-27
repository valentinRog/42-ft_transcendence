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
	const outcome = Context.outcome();

	fetchSettings();

	function saveColors() {
		fetchWithToken('settings/edit', {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				backgroundColor: $settings.pong.colors.background,
				objectsColor: $settings.pong.colors.objects,
				textColor: $settings.pong.colors.text
			})
		});
	}

	function resetColors() {
		$settings.pong.colors.background = '#000000';
		$settings.pong.colors.objects = '#ffffff';
		$settings.pong.colors.text = '#ffffff';
		saveColors();
	}

	let scale = 1;

	let scaleString: string;
	$: if (scaleString !== undefined) {
		scale = parseInt(scaleString) / 100;
	}

	function responseGame(senderId: number, accept: boolean) {
		$gameRequest = $gameRequest.filter((x) => x.id !== senderId);
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

	let activeDrop: string | null = null;
</script>

<div class="container">
	<div class="menu">
		<DropDown name="Game" notif={$gameRequest.length} bind:activeDrop>
			{#if $matchmaking === false}
				<button on:click={() => ($matchmaking = true)}>Matchmaking</button>
			{:else}
				<button class="unavailable">Matchmaking</button>
			{/if}
			{#if $gameRequest.length > 0}
				<RightDrop name="Invitations" notif={$gameRequest.length}>
					{#each $gameRequest as r (r.id)}
						<RightDrop name={r.username}>
							<button on:click={() => responseGame(r.id, true)}>accept</button>
							<button on:click={() => responseGame(r.id, false)}>decline</button>
						</RightDrop>
					{/each}
				</RightDrop>
			{:else}
				<button class="unavailable"> Invitations </button>
			{/if}
		</DropDown>
		<DropDown name="Settings" bind:activeDrop>
			<RightDrop name="Scale">
				<DropRadios
					fields={['60%', '80%', '100%', '120%', '140%', '160%']}
					def="100%"
					bind:selected={scaleString}
				/>
			</RightDrop>
			<RightDrop name="Show">
				<DropCheck fields={selected} />
			</RightDrop>
			<RightDrop name="Colors">
				<div class="color">
					background <input
						type="color"
						bind:value={$settings.pong.colors.background}
						on:change={saveColors}
					/>
				</div>
				<div class="color">
					objects <input
						type="color"
						bind:value={$settings.pong.colors.objects}
						on:change={saveColors}
					/>
				</div>
				<div class="color">
					text <input type="color" bind:value={$settings.pong.colors.text} on:change={saveColors} />
				</div>
				<button on:click={resetColors}>reset</button>
			</RightDrop>
			<button on:click={() => addInstance('PongKeybinds')}>Keybinds</button>
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
