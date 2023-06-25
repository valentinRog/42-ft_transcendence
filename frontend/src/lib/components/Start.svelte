<script lang="ts">
	import { logout } from '$lib/utils/connect';
	import { Context } from '$lib/components/Context.svelte';

	export let desktopHeight: number;

	const apps = Context.apps();
	const addInstance = Context.addInstance();

	let active = false;

</script>

<svelte:body on:click={() => (active = false)} />
<div class="navbar-start" on:click|stopPropagation={() => (active = !active)} class:active>
	<div class="border-inside">
		<img src="/start.png" alt="start" draggable="false" />
		<p class="start">Start</p>
	</div>
</div>
<div class="menu" class:hidden={!active}>
	{#each Object.entries($apps).filter(([k, _]) => k !== 'FriendRequest' && k !== 'Chat' && k !== 'ChatForum') as [k, v]}
		<button class="app-button" on:click|stopPropagation={() => addInstance(k)}>
			<img src={v.TabProps.icon} alt={v.TabProps.name} draggable="false" />
			{v.TabProps.name}</button
		>
	{/each}
	<button on:click={logout}>logout</button>
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
		max-width: 18rem;
		@include tab-contour;
		position: absolute;
		bottom: $navbar-height;
		left: 0;

		button {
			@include dropdown-button;

			&.app-button {
				img {
					width: 1.2rem;
				}
				span {
					margin-left: 2rem;
				}
			}
		}
	}
</style>
