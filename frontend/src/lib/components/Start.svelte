<script lang="ts">
	import { logout } from '$lib/scripts/connect';
	import Dropdown from '$lib/components/Dropdown.svelte';

	let active = false;

	const tree = {
		name: 'des trucs',
		event: () => {},
		children: [
			{
				name: "d'autres trucs",
				event: () => {},
				children: [
					{
						name: 'encore des trucs',
						event: () => {},
						children: [
							{
								name: 'toujours plus de trucs',
								event: () => {},
								children: [
									{
										name: "omg c'est tellement recursif",
										event: () => {},
										children: []
									},
									{
										name: "omg c'est tellement recursif",
										event: () => {},
										children: []
									},
									{
										name: "omg c'est tellement recursif",
										event: () => {},
										children: []
									},
									{
										name: "omg c'est tellement recursif",
										event: () => {},
										children: []
									},
									{
										name: "omg c'est tellement recursif",
										event: () => {},
										children: []
									}
								]
							}
						]
					},
					{
						name: 'plus de trucs ici',
						event: () => {},
						children: []
					}
				]
			},
			{
				name: 'logout',
				event: logout,
				children: []
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
	<Dropdown {...tree} />
	<Dropdown {...tree} />
	<Dropdown {...tree} />
	<Dropdown {...tree} />
	<Dropdown {...tree} />
	<Dropdown {...tree} />
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
		&.hidden {
			display: none;
		}

		position: absolute;
		bottom: $navbar-height;
		left: 0;
	}
</style>
