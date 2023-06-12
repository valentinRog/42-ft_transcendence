<script lang="ts">
	export let name: string;

	let visible = false;
</script>

<div
	class="container"
	on:mouseenter={() => (visible = true)}
	on:mouseleave={() => (visible = false)}
>
	<div class="drop">{name}</div>
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

		div.drop {
			padding: 0.2rem 0.65rem;

			&:hover {
				cursor: pointer;
				background-color: $blue;
				color: white;
			}
		}

		div.content {
			@include tab-contour;
			position: absolute;
		}
	}
</style>
