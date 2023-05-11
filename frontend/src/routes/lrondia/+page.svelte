<svelte:head>
	<style lang="scss">
		body {
			background-color: $background;
		}
	</style>
</svelte:head>

<h1>louise</h1>
<p>hellooooooooooo</p>

<nav class="navbar">
	<div class="navbar-menu">
		<div class="navbar-start">
			<a class="start" href="/">Start</a>
			<a href="/about">A propos</a>
			<a href="/contact">Contact</a>
		</div>
	</div>
</nav>

<style lang="scss">
	$primary-color: rgb(192, 192, 192);
	$navbar-height: 2.5rem;

	.navbar {
		background-color: $primary-color;
		height: $navbar-height;
		color: $font-color;
		position: absolute;
		bottom: 0;
		width: 100%;
		display: flex;
		align-items: center;

		.navbar-menu {
			.navbar-start {
				margin-left: 0.3rem;

				& > a {
					background-color: rgb(192,192,192);
					color: inherit;
					font-size: 1.2rem;
					margin-right: 0.5rem;
					text-decoration: none;
					display: inline-block;
					padding: 0.2rem 2.5rem;
					position: relative; // Ajoutez une position relative pour positionner l'ombre
					border-style: solid;
					border-right-color: black;
					border-bottom-color: black;
					border-left-color: white;
					border-top-color: white;
					border-right-width: 0.2rem;
					border-bottom-width: 0.2rem;
					border-left-width: 0.2rem;
					border-top-width: 0.2rem;
					// border: 0.2rem solid red;
					// border-width: 0.2rem 0 0 0.2rem;

					&:hover {
						text-decoration: underline;
					}
					// &::before {
					// 	content: '';
					// 	position: absolute;
					// 	bottom: -0.1rem;
					// 	right: 0rem;
					// 	width: 100%;
					// 	height: 0.15rem;
					// 	background-color: rgb(0, 0, 0);
					// }
					&::after {
						content: '';
						position: absolute;
						bottom: 0;
						right: 0;
						width: 100%;
						height: 0.15rem;
						background-color: rgb(128, 128, 128);
					}
				}

				.start {
					margin-right: 1.5rem;
					color: black;
				}
			}
		}
	}
</style>
