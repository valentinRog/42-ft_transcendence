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

<button
	class="navbar-start"
	on:click={(event) => {
		event.stopPropagation();
		active = !active;
	}}
	class:active
>
	<a class="start">
		<img src="/start.png" alt="start" draggable="false" />
		Start
	</a>
</button>
<div class="menu" class:hidden={!active}>
	<Dropdown {...tree} {desktopHeight} />
	<Dropdown {...tree} {desktopHeight} />
	<Dropdown {...tree} {desktopHeight} />
	<Dropdown {...tree} {desktopHeight} />
	<Dropdown {...tree} {desktopHeight} />
	<Dropdown {...tree} {desktopHeight} />
</div>

<style lang="scss">
	button.navbar-start {
		margin: 0 0.25rem;
		@include tab;
		.start {
			width: 7rem;
			font-weight: 800;
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
