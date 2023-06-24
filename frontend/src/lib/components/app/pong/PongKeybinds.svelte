<script lang="ts">
	import { Context } from '$lib/components/app/Profile/Context.svelte';

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

<div>
	<button on:click={() => (editing = 'up')}> up </button>
	<div>{$settings.up}</div>
	<button on:click={() => (editing = 'down')}> down </button>
	<div>{$settings.down}</div>
</div>

<style lang="scss">
</style>
