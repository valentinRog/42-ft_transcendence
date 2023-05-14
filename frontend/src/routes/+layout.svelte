<script lang="ts">
	import '$lib/style/style.scss';
	import { token } from '$lib/stores/stores';

	function logout() {
		token.set('');
		localStorage.removeItem('token');
	}
</script>

{#if $token}
	<p>{$token}</p>
	<button on:click={logout}>logout</button>
{:else}
	<a href="login">login / signup</a>
{/if}

<ul>
	<li><a href="/">home</a></li>
	<li><a href="lrondia">louise</a></li>
	<li><a href="drag">drag</a></li>
</ul>

<!-- NAVBAR -->

<nav class="navbar">
	<div class="navbar-menu">
		<div class="navbar-start">
			
			<a class="start" href="/lrondia">
				<img src="/start.png" alt="start">	
				Start
			</a>
			<a href="/lrondia">
				<img src="/pong.png" alt="pong">	
				Pong
			</a>
			<a href="/lrondia">
				<img src="/mail.png" alt="chat">	
				Chat
			</a>
		</div>
	</div>
</nav>

<slot />


<svelte:head>
	<style lang="scss">
		
		$navbar-height: 2.5rem;
		$line-width: 0.1rem;
		
	body {
		background-color: $background;
	}

	.navbar {
		background-color: $grey;
		height: $navbar-height;
		color: $font-color;
		position: absolute;
		bottom: 0;
		width: 100%;
		display: flex;
		align-items: center;
		
		//navbar grey border
		@include nav-border;

		&::after {
			@include tab-top-line(white);
		}

		.navbar-menu {
			.navbar-start {
				margin-left: 0.3rem;

				& > a {
					background-color: $grey;
					color: inherit;
					font-size: 1.2rem;
					margin-right: 0.25rem;
					text-decoration: none;
					display: inline-block;
					width: 15rem;
					padding: 0.2rem 0.8rem;
					position: relative;

					//border around the navbar element in outside mode
					@include tab-border(black, white);
					
					&:active { //inverts colors when clicked on
						@include tab-border(white, black);
					}

					&::before { // line that's light grey nex to the white border when in outside mode
						@include tab-top-line($light-grey);
					}
					
					&:active::before { // changes color when clicked on
						@include tab-top-line($dark-grey);
					}
					
					&::after { // line that's dark grey next to the black border when in outside mode
						@include tab-bottom-line($dark-grey);
					}
				
					&:active::after { //changes color when clicked on
						@include tab-bottom-line($light-grey);
					}

					img {
						@include tab-logo;
					}
				}

				.start {
					width:auto;
					font-weight: 800;
				}

				
			}
		}
	}

</style>
</svelte:head>