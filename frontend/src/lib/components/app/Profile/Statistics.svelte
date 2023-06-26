<script lang="ts">
	import { Context } from '$lib/components/Context.svelte';
	import { writable } from 'svelte/store';

	export let userId: number | null | undefined = null;

	const fetchStatistics = Context.fetchStatistics();
	const fetchWithToken = Context.fetchWithToken();
	const statistics = Context.statistics();
	let currentStatistics = writable<Context.Stat>();

	$: {
		if (userId === null) {
			currentStatistics.set($statistics);
		}
	}

	(async () => {
		if (userId === null) {
			await fetchStatistics();
		}
		else {
			const res = await fetchWithToken(`stat/get-stat/${userId}`);
			currentStatistics.set( await res.json());
		}
	})();

</script>

<div>
	{#if $currentStatistics !== undefined && $currentStatistics !== null}
	  <div class="container">
		<div class="image">
		  <img src="{$currentStatistics?.ladder}.png" alt="ladder image" width="100" height="100">
		</div>
		<div class="stats">
		  <div>Win: {$currentStatistics?.wins}</div>
		  <div>Loss: {$currentStatistics?.losses}</div>
		  <div>Elo: {$currentStatistics?.elo} ({$currentStatistics?.ladder})</div>
		  <div class="ladder" id="ladder"></div>
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
		padding: 0 0.2rem;
		flex: 0 0 auto;
		margin-right: 10px;
	}
	
	.stats {
		@include tab-border($light-grey, $dark-grey);
		flex: 1 1 auto;
		padding : 0.75rem;

		div {
			margin-bottom: 0.5rem;
		}
	}

</style>
