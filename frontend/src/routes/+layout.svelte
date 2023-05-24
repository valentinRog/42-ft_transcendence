<script lang="ts">
	import { token } from '$lib/stores/stores';
	import { page } from '$app/stores';
	import '$lib/style/style.scss';
</script>

<svelte:head>
	<title>Yo</title>
</svelte:head>

{#if $token || $page.url.pathname === '/login'}
	<slot />
{/if}
