<script lang="ts">
	export let icon: string;
	export let name: string;
	export let active: boolean;
</script>

<a href="/" on:click class:active>
	<img src={icon} alt={name} />
	{name}
</a>

<style lang="scss">
	a {
		@include tab;
		margin-right: 0.5rem;
	}
</style>
