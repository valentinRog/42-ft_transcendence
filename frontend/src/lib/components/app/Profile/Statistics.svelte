<script lang="ts">
	import { Context } from '$lib/components/app/Profile/Context.svelte';
	import { user } from '$lib/stores';

	export let userId: number | null | undefined = null;

	const fetchStatistics = Context.fetchStatistics();
	const fetchWithToken = Context.fetchWithToken();
	const statistics = Context.statistics();

	let currentStatistics: any = {};

	$: {}

	(async () => {
		if (userId === null) {
			userId = $user?.id;
		}

		const res = await fetchWithToken(`stat/get-stat/${userId}`);
		currentStatistics = await res.json();
		console.log(currentStatistics);

	})();

</script>

<div>
	  <div class="container">
		<div class="image">
		  <img src="{currentStatistics.ladder}.png" alt="ladder image" width="100" height="100">
		</div>
		<div class="stats">
		  <div>Win: {currentStatistics.wins}</div>
		  <div>Loss: {currentStatistics.losses}</div>
		  <div>Elo: {currentStatistics.elo} ({currentStatistics.ladder})</div>
		  <div class="ladder" id="ladder"></div>
		</div>
	  </div>
</div>

<style lang="scss">

	.container {
		display: flex;
		align-items: center;
	}

	.image {
		flex: 0 0 auto;
		margin-right: 10px;
	}

	.stats {
		flex: 1 1 auto;
	}

</style>
