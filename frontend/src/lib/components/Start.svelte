<script lang="ts">
	import { logout } from '$lib/scripts/connect';
	let active = false;
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
		<img src="/start.png" alt="start" draggable="false"/>
		Start
	</a>
</button>
<div class="menu" class:hidden={!active}>
	<button on:click={logout}>Logout</button>
	<button on:click={logout}>Logout</button>
	<button on:click={logout}>Logout</button>
	<button on:click={logout}>Logout</button>
	<button on:click={logout}>Logout</button>
	<button on:click={logout}>Logout</button>
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
		width: 18rem;
		background-color: yellow;
		bottom: $navbar-height;
		left: 0;

		button {
			width: 100%;
		}
	}
</style>
