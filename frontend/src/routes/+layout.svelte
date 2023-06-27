<script lang="ts">
	import '$lib/style/style.scss';
	import { loading } from '$lib/stores';
</script>

<svelte:head>
	<title>Yo</title>
</svelte:head>

<div class:loading={$loading}>
	<slot />
</div>

<style lang="scss">
	.loading {
		cursor: wait;
	}
</style>
<link rel="icon" type="image/jpg" href="/yoooo.png">
