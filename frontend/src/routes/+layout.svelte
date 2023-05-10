<script lang="ts">
	import '$lib/style/style.scss';
	import { token } from '$lib/stores/stores';
</script>

{#if $token}
	<p>{$token}</p>
{:else}
	<a href="login">login / signup</a>
{/if}

<a href="/">home</a>
<a href="lrondia">louise</a>

<slot />

<style lang="scss">
</style>
