<script lang="ts">
	import { afterUpdate } from 'svelte';

	export let name: string;
	export let desktopHeight: number | null = null;

	let visible = false;
	let contentElement: HTMLElement | null = null;

	function boundBot() {
		if (contentElement !== null && desktopHeight !== null) {
			const y = contentElement.getBoundingClientRect().bottom;
			if (y > desktopHeight) {
				contentElement.style.top = `${desktopHeight - y}px`;
			}
		}
	}

	afterUpdate(() => {
		boundBot();
	});
</script>

<div
	class="container"
	on:mouseenter={() => (visible = true)}
	on:mouseleave={() => (visible = false)}
>
	<div class="drop">{name}</div>
	<div class="content" class:hide={!visible} bind:this={contentElement}>
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
		}

		div.content {
			position: absolute;
			top: 0;
			left: 100%;
			@include tab-contour;
		}
	}
</style>
