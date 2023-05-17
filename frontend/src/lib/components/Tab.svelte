<script lang="ts">
	export let route: string;
	export let name: string;
</script>

<a href="/" on:click>
	<img src={route} alt={name} />
	{name}
</a>

<style lang="scss">
	@include tab;
</style>
