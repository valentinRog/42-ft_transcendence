<script lang="ts">
	import ProfileInfo from './ProfileInfo.svelte';

	let activeTabIndex = 0;
	const tabTitle = [
		"Information",
		"Statistics",
		"Match history",
	];

</script>

<div class="window-body">
	<menu role="tablist">
	  {#each tabTitle as content, index}
		<li role="tab" aria-selected={index === activeTabIndex} on:click={() => activeTabIndex = index}>
		  <a href="#tabs">{content}</a>
		</li>
	  {/each}
	</menu>

	<div class="window" role="tabpanel">
	  <div class="window-body">
		  {#if activeTabIndex === 0}
		  <div class="window-body">
			<ProfileInfo />
		  </div>

		  {:else if activeTabIndex === 1}
			<p class="tab-content">{"stat"}</p>
		  {:else if activeTabIndex === 1}
			<p class="tab-content">{"stat"}</p>
		  {/if}
	  </div>
	</div>
  </div>


<style lang="scss">

	@include onglet;

</style>
