<script lang="ts">
	import MatchHistory from './MatchHistory.svelte';
	import ProfileInfo from './Information.svelte';
	import Statistics from './Statistics.svelte';

	export let userId: number | null = null;

	let activeTabIndex = 0;
	const tabTitle = ['Informations', 'Statistics', 'Match history'];
</script>

<div class="window-body">
	<menu role="tablist">
		{#each tabTitle as content, index}
			<li
				role="tab"
				aria-selected={index === activeTabIndex}
				on:click={() => (activeTabIndex = index)}
			>
				<a>{content}</a>
			</li>
		{/each}
	</menu>

	<div class="window" role="tabpanel">
		<div class="window-body">
			{#if activeTabIndex === 0}
				<div class="window-body">
					<ProfileInfo {userId} />
				</div>
			{:else if activeTabIndex === 1}
				<Statistics {userId}/>
			{:else if activeTabIndex === 2}
				<MatchHistory {userId}/>
			{/if}
		</div>
	</div>
</div>

<style lang="scss">
	@include onglet;
</style>
