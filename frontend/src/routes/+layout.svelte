<script lang="ts">
	import '$lib/style/style.scss';
	import { token } from '$lib/stores/stores';

	function logout() {
		token.set('');
		localStorage.removeItem('token');
	}
</script>

<!-- {#if $token}
	<p>{$token}</p>
	<button on:click={logout}>logout</button>
{:else}
	<a href="login">login / signup</a>
{/if}

<ul>
	<li><a href="/">home</a></li>
	<li><a href="lrondia">louise</a></li>
	<li><a href="desktop">desktop</a></li>
</ul> -->

<slot />

<svelte:head>
	<style lang="scss">
	</style>
</svelte:head>
