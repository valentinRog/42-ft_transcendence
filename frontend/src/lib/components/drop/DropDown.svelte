<script lang="ts">
	export let name: string;
	export let notif = 0;

	let visible = false;
</script>

<div
	class="container"
	on:mouseenter={() => (visible = true)}
	on:mouseleave={() => (visible = false)}
>
	<div class="drop">
		{name}
		{#if notif !== 0}
			({notif})
		{/if}
	</div>
	<div class="content" class:hidden={!visible}>
		<slot />
	</div>
</div>

<style lang="scss">
	.hidden {
		display: none;
	}

	div.container {
		position: relative;
		&:hover {
			@include tab-border($dark-grey, $light-grey);
		}

		div.drop {
			padding: 0.2rem 0.65rem;

			&:hover {
				cursor: url($click), auto;
			}
		}

		div.content {
			@include tab-contour;
			position: absolute;
		}
	}
</style>
