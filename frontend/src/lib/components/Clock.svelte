<script lang="ts">
	import { onDestroy } from 'svelte';
	import { Context } from '$lib/components/app/Profile/Context.svelte';

	const soundOn = Context.soundOn();

	let time = new Date();

	const interval = setInterval(() => (time = new Date()), 1000);

	const formatter = new Intl.DateTimeFormat('en', {
		hour12: false,
		hour: 'numeric',
		minute: '2-digit'
	});

	onDestroy(() => clearInterval(interval));
</script>

<div class="navbar-clock">
	<p>
		<img
			on:mousedown={() => ($soundOn = !$soundOn)}
			src={$soundOn ? 'sound-on.png' : 'sound-off.png'}
			alt={$soundOn ? 'sound on' : 'sound off'}
			draggable="false"
		/>
		{formatter.format(time)}
	</p>
</div>

<style lang="scss">
	.navbar-clock {
		margin: 0 0.25rem;
		margin-left: auto;
		display: flex;
		align-items: center;
		vertical-align: auto;
		@include tab-contour-hollow;
		p {
			img {
				margin-left: 0.5rem;
				@include tab-logo;
			}
			font-size: large;
			margin-left: auto;
			padding: 0.25rem;
			width: 5.5rem;
		}
	}
</style>
