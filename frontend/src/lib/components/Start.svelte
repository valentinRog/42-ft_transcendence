<script lang="ts">
	import { logout } from '$lib/utils/connect';
	import { Context } from '$lib/components/Context.svelte';
	import RightDrop from '$lib/components/drop/RightDrop.svelte';

	export let desktopHeight: number;

	let active = false;

	const fetchWithToken = Context.fetchWithToken();

	function enable2fa() {
		fetchWithToken('2fa/enable', {
			method: 'POST'
		});
	}
</script>

<div class="navbar-start" on:click|stopPropagation={() => (active = !active)} class:active>
	<div class="border-inside">
		<img src="/start.png" alt="start" draggable="false" />
		<p class="start">Start</p>
	</div>
</div>
<div class="menu" class:hidden={!active}>
	<RightDrop name="trucs" {desktopHeight} />
	<RightDrop name="trucs" {desktopHeight} />
	<RightDrop name="trucs" {desktopHeight}>
		<RightDrop name="trucs" {desktopHeight}>
			<button on:click={logout}>logout</button>
			<button on:click={enable2fa}>enable 2fa</button>
		</RightDrop>
		<RightDrop name="trucs" {desktopHeight}>
			<button on:click={logout}>logout</button>
			<button on:click={enable2fa}>enable 2fa</button>
		</RightDrop>
		<RightDrop name="trucs" {desktopHeight}>
			<button on:click={logout}>logout</button>
			<button on:click={enable2fa}>enable 2fa</button>
		</RightDrop>
	</RightDrop>
</div>

<style lang="scss">
	.hidden {
		display: none;
	}

	.navbar-start {
		@include tab;
		margin: 0 0.25rem;
		flex-basis: 7rem;
		padding: 0;
		width: 7rem;
		.start {
			font-weight: 800;
			font-size: larger;
		}
	}

	div.menu {
		min-width: 12rem;
		@include tab-contour;
		position: absolute;
		bottom: $navbar-height;
		left: 0;

		button {
			@include dropdown-button;
		}
	}
</style>
