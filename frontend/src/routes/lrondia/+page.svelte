
<h1>louise</h1>
<p>hellooooooooooo</p>
<!-- <svelte:head>
	<style lang="scss">
		body {
			background-color: $background;
		}
	</style>
</svelte:head>

<h1>louise</h1>
<p>hellooooooooooo</p>

<div class="icons">
	<div class="icon">
		<img src="/pong.png" alt="pong">
		<span>Pong</span>
	</div>
</div>

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

<style lang="scss">

	$navbar-height: 2.7rem;
	$line-width: 0.15rem;

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

	.icons {
		display: flex;
		align-items: left;

		.icon {
			margin: 1rem;
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 0.3rem;
			img {
				width: 4rem;		
			}
			span {
				color: white;
			}
		}
	}

</style> -->
