<script lang="ts">
	export let name = '';
	export let children: any[] = [];
	export let event: any;
	export let level = 0;
	let isOpen = false;
</script>

<div class="dropdown" on:mouseleave={() => (isOpen = false)}>
	<button on:click={event} on:mouseenter={() => (isOpen = true)}>
		<span>{name}</span>
	</button>

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

	button {
		cursor: pointer;
		width: 100%;
		padding: 0.4rem 0.6rem;
	}

	.dropdown-content {
		position: absolute;
		bottom: 0;
		left: 100%;
		width: 100%;
	}
</style>
