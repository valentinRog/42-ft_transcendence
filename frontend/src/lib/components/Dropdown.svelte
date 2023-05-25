<script lang="ts">
	export let name = '';
	export let children: any[] = [];
	export let event: any;
	export let level = 0;
	let isOpen = false;
</script>

<div class="dropdown" on:mouseleave={() => (isOpen = false)}>
	{#if children.length}
		<div class="dropdown-div" on:mouseenter={() => (isOpen = true)}>
			<span>{name}</span>
		</div>
	{:else}
		<button class="dropdown-button" on:click={event}>
			<span>{name}</span>
		</button>
	{/if}

	{#if isOpen}
		<div class="dropdown-content">
			{#each children as child}
				<svelte:self {...child} level={level + 1} />
			{/each}
		</div>
	{/if}
</div>

<style lang="scss">
	.dropdown {
		position: relative;
		display: block;
		width: 10rem;
	}

	.dropdown-button {
		width: 100%;
		padding: 0.4rem 0.6rem;
		@include no-border;
		background-color: $grey;
		cursor: url($click), auto;
		padding: 0.15rem 0.25rem;
		font-size: medium;
	}

	.dropdown-button:hover {
		background-color: $blue;
		color: white;
	}
	.dropdown-div {
		background-color: $grey;
		padding: 0.15rem 0.25rem;
	}

	.dropdown-div:hover {
		background-color: $blue;
		color: white;
	}

	.dropdown-content {
		@include tab-contour;
		position: absolute;
		bottom: 0;
		left: 100%;
		width: 100%;
	}
</style>
