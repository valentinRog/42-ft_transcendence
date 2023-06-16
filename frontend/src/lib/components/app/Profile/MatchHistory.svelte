<script lang="ts">
	import { Context } from '$lib/components/Context.svelte';

	//document.querySelectorAll('table.interactive').forEach(element => {
	//  element.addEventListener('click', (event) => {
	//	const row = event.path.find(element => element.tagName === 'TR' && element.parentElement.tagName === 'TBODY');
	//	if (row) {
	//	  row.classList.toggle('highlighted');
	//	}
	//  })
	//});

	const fetchHistory = Context.fetchHistory();
	const history = Context.history();

	(async () => {
		await fetchHistory();
		console.log($history);
	})();

</script>

<div class="sunken-panel" style="height: 150px; width: 240px;">
<!--<div class="sunken-panel" style="height: 20rem; width: 20rem;">-->
	<table class="interactive">
	  <thead>
		<tr>
		  <th>Result</th>
		  <th>Opponent</th>
		  <th>Date</th>
		</tr>
	  </thead>
	  <tbody>
		<tr>
		  <td>MySQL ODBC 3.51 Driver</td>
		  <td>3.51.11.00</td>
		  <td>MySQL AB</td>
		</tr>
		<tr>
		  <td>SQL Server</td>
		  <td>3.70.06.23</td>
		  <td>Microsoft Corporation</td>
		</tr>
	  </tbody>
	</table>
</div>


<style lang="scss">

	@include table;

</style>
