<script lang="ts">
	import DropButton from '$lib/components/drop/DropButton.svelte';

	export let fields: string[];
	export let def: string;
	export let selected: string;

	$: if (selected === undefined) selected = def;
	console.log(def);
</script>

<div>
	{#each fields as field}
		<DropButton on:click={() => (selected = field)}>
			<span class:hide={field !== selected}>v</span>
			{field}
		</DropButton>
	{/each}
</div>

<style lang="scss">
	span {
		margin-right: 0.8rem;

		&.hide {
			color: transparent;
		}
	}
</style>
