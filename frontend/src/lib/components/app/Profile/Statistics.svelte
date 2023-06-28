<script lang="ts">
	import { Context } from '$lib/components/Context.svelte';
	import { writable } from 'svelte/store';

	export let userId: number | null | undefined = null;

	const fetchStatistics = Context.fetchStatistics();
	const fetchWithToken = Context.fetchWithToken();
	const statistics = Context.statistics();
	const outcome = Context.outcome();

	let currentStatistics = writable<Context.Stat>();

	$: if (userId === null) $currentStatistics = $statistics;

	async function updateStatistics() {
		if (userId === null) {
			await fetchStatistics();
		} else {
			const res = await fetchWithToken(`stat/get-stat/${userId}`);
			$currentStatistics = await res.json();
		}
	}

	updateStatistics();
	$: if ($outcome) updateStatistics();
</script>

<div>
	{#if $currentStatistics !== undefined && $currentStatistics !== null}
		<div class="container">
			<div class="stats">
				<div>Win: {$currentStatistics?.wins}</div>
				<div>Loss: {$currentStatistics?.losses}</div>
				<div>Elo: {$currentStatistics?.elo} ({$currentStatistics?.ladder})</div>
				<div class="ladder" id="ladder" />
			</div>
			<div class="image">
				<img src="{$currentStatistics?.ladder}.png" alt="ladder image" width="100" height="100" />
			</div>
		</div>
	{/if}
</div>

<style lang="scss">
	.container {
		margin-top: 0.5rem;
		display: flex;
		align-items: center;
	}

	.image {
		@include tab-border($dark-grey, $light-grey);
		height: 6.5rem;
		padding: 0 0.2rem;
		margin-left: 10px;
		img {
			padding-bottom: 0.5rem;
			height: 100%;
			width: 100%;
		}
	}

	.stats {
		@include tab-border($light-grey, $dark-grey);
		flex: 1 1 auto;
		padding: 0.15rem 0.6rem;

		div {
			margin-top: 0.6rem;
		}
	}
</style>
