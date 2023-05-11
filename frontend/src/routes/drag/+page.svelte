<script lang="ts">
	import Dragable from '$lib/Dragable.svelte';
	import {page} from '$app/stores';

	console.log($page.url.searchParams);

	let zstack = [0, 1, 2];

	function putOnTop(i: number) {
		zstack = zstack.filter((z) => z !== i);
		zstack.push(i);
	}
</script>

{#each zstack as _, i}
	<Dragable>
		<div
			class="dragable box{i + 1}"
			style="z-index: {zstack.indexOf(i)};"
			on:mousedown={() => {
				putOnTop(i);
			}}
		/>
	</Dragable>
{/each}

<style lang="scss">
	div.dragable {
		width: 400px;
		height: 200px;

		&.box1 {
			background-color: blue;
		}
		&.box2 {
			background-color: green;
		}
		&.box3 {
			background-color: red;
		}
	}
</style>
