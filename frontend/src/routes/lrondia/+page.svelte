<svelte:head>
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
			<a href="/lrondia">Contact</a>
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
		border-style: solid;
		border-width: $line-width 0 0 0;
		border-top-color: $light-grey;

		&::after {
			content: '';
			position: absolute;
			top: 0rem;
			right: 0rem;
			width: 100%;
			height: 0.1rem;
			background-color: white;
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
					border-style: solid;
					border-right-color: black;
					border-bottom-color: black;
					border-left-color: white;
					border-top-color: white;
					border-right-width: $line-width;
					border-bottom-width: $line-width;
					border-left-width: $line-width;
					border-top-width: $line-width;
					
					&:active {
						border-right-color: white;
						border-bottom-color: white;
						border-left-color: black;
						border-top-color: black;
					}

					&::before {
						content: '';
						position: absolute;
						top: 0rem;
						right: 0rem;
						width: 100%;
						height: $line-width;
						background-color: $light-grey;
					}

					&:active::before {
						background-color: $dark-grey;
					}

					&::after {
						content: '';
						position: absolute;
						bottom: 0;
						right: 0;
						width: 100%;
						height: $line-width;
						background-color: $dark-grey;
					}

					&:active::after {
						background-color: $light-grey;
					}

					img {
						width: 1.4rem;
						vertical-align: sub;
						margin-right: 0.4rem;
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

</style>
