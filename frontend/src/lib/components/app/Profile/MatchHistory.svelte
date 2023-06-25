<script lang="ts">
	import { Context } from '$lib/components/app/Profile/Context.svelte';
	import { user } from '$lib/stores';

	export let userId: number | null | undefined = null;

	const fetchWithToken = Context.fetchWithToken();
	const fetchHistory = Context.fetchHistory();
	const history = Context.history();

	let current: Context.Match | null = null;

	let currentHistory : Context.Match[] = [];

	(async () => {
		if (userId === null) {
			userId = $user?.id;
		}

		const res = await fetchWithToken(`stat/get-history/${userId}`);
		let data = await res.json();
		data.forEach(function (element: any, index: number) {
			data[index] = {
				result: $user?.username === element.winnerName ? 'Win' : 'Lose',
				opponent: $user?.username === element.winnerName ? element.loserName : element.winnerName,
				createdAt: element.createdAt
			};
		});
		currentHistory = data;
	})();


</script>

<div class="sunken-panel" style="height: 15rem; width: 18rem;">
	{#if currentHistory.length === 0}
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
			{#each Object.values(currentHistory) as row}
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
