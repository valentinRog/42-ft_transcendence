<script lang="ts">
	import { v4 as uuid } from 'uuid';

	const id = uuid();

	export let name: string;
	export let notif = 0;
	export let activeDrop: string | null = null;
</script>

<div class="container">
	<div
		on:click={() => (activeDrop = activeDrop === id ? null : id)}
		class:active={activeDrop === id}
		class="drop"
	>
		{name}
		{#if notif !== 0}
			({notif})
		{/if}
	</div>
	<div class="content" class:hidden={!(activeDrop === id)}>
		<slot />
	</div>
</div>

<svelte:window on:mousedown={() => (activeDrop = null)} />

<style lang="scss">
	.hidden {
		display: none;
	}

	div.container {
		position: relative;
		div.drop {
			padding: 0 0.65rem;
			@include tab-border(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0));

			&:hover {
				@include tab-border($dark-grey, $light-grey);
				cursor: url($click), auto;
				&.active {
					@include tab-border($light-grey, $dark-grey);
				}
			}
		}

		div.content {
			@include tab-contour;
			position: absolute;
		}
	}
</style>
