<script lang="ts">
	import { Context } from '$lib/components/Context.svelte';

	const fetchHistory = Context.fetchHistory();
	const history = Context.history();

	let current: Context.Match | null = null;

	(async () => {
		await fetchHistory();
	})();
</script>

<div class="sunken-panel" style="height: 15rem; width: 18rem;">
	{#if $history.length === 0}
			<tr>
				<td colspan="3">You have not participated in any matches</td>
			</tr>
	{:else}
	<table class="interactive">
		<thead>
			<tr>
				<th>Result</th>
				<th>Opponent</th>
				<th>Date</th>
			</tr>
		</thead>
		<tbody>
			{#each Object.values($history) as row}
				<tr
					class={current === row ? 'highlighted' : ''}
					on:click={() => (current === row ? (current = null) : (current = row))}
				>
					{#each Object.values(row) as cell}
						<td>{cell}</td>
					{/each}
				</tr>
			{/each}

		</tbody>
	</table>
	{/if}
</div>

<style lang="scss">
	@include table-95;
</style>
