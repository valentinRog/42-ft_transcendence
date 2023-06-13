<svelte:head>
	<title>Yo</title>
</svelte:head>

<slot />

<style lang="scss" global>
	* {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
		font-family: $font;
	}

	@font-face {
		font-family: 'W95';
		src: url('/fonts/w95fa.woff2') format('woff2');
		font-weight: normal;
		font-style: normal;
	}

	@font-face {
		font-family: 'pong-score';
		src: url('/fonts/pong-score.ttf') format('truetype');
	}

	body {
		background-color: $background;
		font-family: $font;
		color: $font-color;
		cursor: url($mouse), auto;
	}

	button,
	input[type='submit'] {
		cursor: url($click), auto;
		@include tab-contour;
		@include tab-contour-active;
		font-size: 0.8rem;
	}

	a:hover {
		cursor: url($click), auto;
	}


	::-webkit-scrollbar {
		width: 1rem;
	}
	::-webkit-scrollbar-track {
		background-image: url("/scroll-back.png");
		background-repeat: repeat;
	}	
	::-webkit-scrollbar-thumb {
		margin: 0 0.2rem;
		background-color: $grey;
		@include tab-border;
	}	
	::-webkit-scrollbar-button {
		background-image: url("/arrow-down.png");
		background-size: 0.5rem;
		background-repeat: no-repeat;
		background-position: center; 
		background-color: $grey;
		@include tab-border;
	}
	
	::-webkit-scrollbar-button:vertical:decrement {
		background-image: url("/arrow-up.png");
	}
</style>
