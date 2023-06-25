<script lang="ts">
    import type { Writable } from 'svelte/store';

	export let fields: Writable<Map<string, boolean>>;

	function handleClick(field: string) {
		$fields.set(field, !$fields.get(field));
		$fields = $fields;
	}
</script>

<div>
	{#each [...$fields] as [k, v]}
		<button on:click={() => handleClick(k)}>
			<span class:hide={!v}>v</span>
			{k}
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
