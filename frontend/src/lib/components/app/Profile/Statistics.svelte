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

<body>
	<pre>
	  {currentStatistics.wins}
	</pre>
  </body>

<style lang="scss">
	@include table-95;
</style>
