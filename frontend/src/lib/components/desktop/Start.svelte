<script lang="ts">
	import { logout, enable2fa } from '$lib/utils/connect';
	import Dropdown from '$lib/components/dropdown/Dropdown.svelte';
	import type { Tree } from '../dropdown/dropdown';

	export let desktopHeight: number;

	let active = false;

	const tree: Tree = {
		name: 'des trucs',
		children: [
			{
				name: "d'autres trucs",
				children: [
					{
						name: 'encore des trucs',
						children: [
							{
								name: 'toujours plus de trucs',
								event: () => {},
								children: [
									{
										name: "omg c'est tellement recursif",
										event: () => {}
									},
									{
										name: "omg c'est tellement recursif",
										event: () => {}
									},
									{
										name: "omg c'est tellement recursif",
										event: () => {}
									},
									{
										name: "omg c'est tellement recursif",
										event: () => {}
									},
									{
										name: "omg c'est tellement recursif",
										event: () => {}
									}
								]
							}
						]
					},
					{
						name: 'plus de trucs ici',
						event: () => {}
					}
				]
			},
			{
				name: 'logout',
				event: logout
			},
			{
				name: '2fa',
				event: enable2fa
			}
		]
	};
</script>

<div
	class="navbar-start"
	on:click={(event) => {
		event.stopPropagation();
		active = !active;
	}}
	class:active
>
	<div class="border-inside">
		<img src="/start.png" alt="start" draggable="false" />
		<p class="start">Start</p>
	</div>
</div>
<div class="menu" class:hidden={!active}>
	<Dropdown {...tree} {desktopHeight} />
	<Dropdown {...tree} {desktopHeight} />
	<Dropdown {...tree} {desktopHeight} />
	<Dropdown {...tree} {desktopHeight} />
	<Dropdown {...tree} {desktopHeight} />
	<Dropdown {...tree} {desktopHeight} />
</div>

<style lang="scss">
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
		@include tab-contour;
		&.hidden {
			display: none;
		}
		position: absolute;
		bottom: $navbar-height;
		left: 0;
	}
</style>
