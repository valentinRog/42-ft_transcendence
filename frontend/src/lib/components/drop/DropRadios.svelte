<script lang="ts">
	export let fields: string[];
	export let def: string;
	export let selected: string;

	$: if (selected === undefined) selected = def;
</script>

<div>
	{#each fields as field}
		<button on:click={() => (selected = field)}>
			<span class:hide={field !== selected}>v</span>
			{field}
		</button>
	{/each}
</div>

<style lang="scss">
	span {
		margin-right: 0.8rem;

		&.hide {
			color: transparent;
		}
	}

	button {
		@include dropdown-button;
	}
</style>
