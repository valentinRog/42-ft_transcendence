<script lang="ts">
	import Dropdown from '$lib/components/Dropdown.svelte';
	import type { Tree } from '$lib/components/Dropdown.svelte';

	export let dropdowns: { name: string; trees: Tree[] }[] = [];
	let dropdownsShow = new Set<number>();
</script>

<div class="menu">
	{#each dropdowns as { name, trees }, i}
		<div
			on:mouseenter={() => {
				dropdownsShow.add(i);
				dropdownsShow = dropdownsShow;
			}}
			on:mouseleave={() => {
				dropdownsShow.delete(i);
				dropdownsShow = dropdownsShow;
			}}
		>
			<button>{name}</button>
			<div class:hidden={!dropdownsShow.has(i)} class="dropdown">
				{#each trees as tree}
					<Dropdown {...tree} desktopHeight={10000} />
				{/each}
			</div>
		</div>
	{/each}
</div>

<style lang="scss">
	div.menu {
		display: flex;

		button {
			@include dropdown-button;
		}

		div.hidden {
			display: none;
		}

		div.dropdown {
			position: absolute;
		}
	}
</style>
