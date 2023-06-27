<script lang="ts">
	import { Context } from '$lib/components/Context.svelte';

	const fetchWithToken = Context.fetchWithToken();
	const fetchSettings = Context.fetchSettings();
	const settings = Context.settings();

	let editing: string | null = null;

	async function handleKeyDown(e: KeyboardEvent) {
		if (editing !== null) {
			await fetchWithToken('settings/edit', {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: `{"${editing}": "${e.key}"}`
			});
			const res = await fetchSettings();
			console.log(res);
			editing = null;
		}
	}
</script>

<svelte:window on:keydown={handleKeyDown} />

<div class="container">
	<div>
		<strong>up:</strong>
		<div>
			{#if editing === 'up'}
				* press a key *
			{:else}
				{$settings.pong.up}
			{/if}
			{#if editing === null}
				<button on:click={() => (editing = 'up')}>edit</button>
			{:else}
				<button class="disable" disabled>edit</button>
			{/if}
		</div>
	</div>
	<div>
		<strong>down:</strong>
		<div>
			{#if editing === 'down'}
				* press a key *
			{:else}
				{$settings.pong.down}
			{/if}
			{#if editing === null}
				<button on:click={() => (editing = 'down')}>edit</button>
			{:else}
				<button class="disable" disabled>edit</button>
			{/if}
		</div>
	</div>
</div>

<style lang="scss">
	div.container {
		margin: 0.2rem;
		padding: 0.4rem;
		min-width: 12rem;
		@include tab-border(white, $dark-grey);

		> div > div {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 1rem;
		}

		button {
			@include button-95;
			padding: 0.2rem 0.6rem;
			font-size: medium;

			&.disable {
				color: hsl(0, 0%, 90%);
			}
		}
	}
</style>
