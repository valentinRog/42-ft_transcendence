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

<div class="statistic-pic">
	{#if $currentStatistics !== undefined && $currentStatistics !== null}
		<ul class="whole-box">
			<div class="stats">
				<li class="box">Win: {$currentStatistics?.wins}</li>
				<li class="box">Loss: {$currentStatistics?.losses}</li>
				<li class="box">Elo: {$currentStatistics?.elo} ({$currentStatistics?.ladder})</li>
				<div class="ladder" id="ladder" />
			</div>
			<div class="ladder-image">
				<img src="{$currentStatistics?.ladder}.png" alt="ladder image" width="100" height="100" />
			</div>
		</ul>
	{/if}
</div>

<style lang="scss">

	li {
		list-style: none;
		padding: 0.5rem;
		margin-bottom: 0.25rem;
		width: 12rem;
		@include tab-contour-hollow;
	}

	.statistic-pic {

		.whole-box {
			display: flex;
			flex-direction: row;
		}

		.ladder-image {
			display: flex;
			justify-content: center;
			align-items: center;
			overflow: hidden;
			margin-left: 3rem;
			width: 7rem;
			height: 6.72rem;
			@include tab-border($dark-grey, $light-grey);

			img {
				position: center;
			}
		}
	}

</style>
