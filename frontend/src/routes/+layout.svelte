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
		
		$navbar-height: 2.7rem;
		$line-width: 0.15rem;
		
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

		&::after { //white line under grey border (a bit too thin ?)
			@include nav-top-line;
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
					@include tab-outside-border;
					
					&:active { //inverts colors when clicked on
						@include tab-inside-border;
					}

					&::before { // line that's light grey nex to the white border when in outside mode
						@include tab-outside-top-line;
					}
					
					&:active::before { // changes color when clicked on
						@include tab-inside-top-line;
					}
					
					&::after { // line that's dark grey next to the black border when in outside mode
						@include tab-outside-bottom-line;
					}
				
					&:active::after { //changes color when clicked on
						@include tab-inside-bottom-line;
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