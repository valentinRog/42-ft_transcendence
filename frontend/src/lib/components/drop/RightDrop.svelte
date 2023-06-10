<script lang="ts">
	import { onMount, afterUpdate } from 'svelte';

	export let name: string;
	export let desktopHeight: number | null = null;

	let visible = false;
	let content: HTMLElement | null = null;

	afterUpdate(() => {
		if (desktopHeight === null) return;
		const y = content!.getBoundingClientRect().bottom;
		if (y > desktopHeight) {
			content!.style.top = `${desktopHeight - y}px`;
		}
	});
</script>

<div
	class="container"
	on:mouseenter={() => (visible = true)}
	on:mouseleave={() => (visible = false)}
>
	<div class="drop" class:path={visible}>{name}</div>
	<div class="content" class:hide={!visible} bind:this={content}>
		<slot />
	</div>
</div>

<style lang="scss">
	.hide {
		display: none;
	}

	div.container {
		position: relative;

		div.drop {
			@include dropdown-button;

			&.path {
				background-color: $blue;
				color: white;
			}
		}

		div.content {
			position: absolute;
			top: 0;
			left: 100%;
			@include tab-contour;
		}
	}
</style>
