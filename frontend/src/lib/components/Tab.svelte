<script lang="ts">
	export let route: string;
	export let name: string;
	export let active: boolean;
</script>

<a href="/" on:click class:active>
	<img src={route} alt={name} />
	{name}
</a>

<style lang="scss">
	a {
		@include tab;
		margin-right: 0.5rem;
	}
</style>
