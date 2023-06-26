<script lang="ts">
	export let name: string;
	export let notif = 0;
	let activeDrop : boolean = false;
</script>

<div
	class="container"
>
	<div on:click={() => { activeDrop = !activeDrop; }} class="drop {activeDrop === true ? 'active' : ''}">
		{name}
		{#if notif !== 0}
 			({notif})
		{/if}
	</div>
	<div class="content" class:hidden={!activeDrop}>
		<slot />
	</div>
</div>

<svelte:window on:mousedown={() => (activeDrop = false)} />
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
