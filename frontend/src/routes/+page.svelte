<h1>Yo</h1>

<!-- ICONES DE BUREAU -->

<div class="icons">
	<div class="icon">
		<img src="/pong.png" alt="pong">
		<span>Pong</span>
	</div>
</div>

<!-- NAVBAR -->

<nav class="navbar">
	<div class="navbar-menu">
		<div class="navbar-start">
			
			<a class="start" href="/">
				<img src="/start.png" alt="start">	
				Start
			</a>
			<a href="/">
				<img src="/pong.png" alt="pong">	
				Pong
			</a>
			<a href="/">
				<img src="/mail.png" alt="chat">	
				Chat
			</a>
		</div>
	</div>
</nav>

<style lang="scss">

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

	@include navbar;

</style>