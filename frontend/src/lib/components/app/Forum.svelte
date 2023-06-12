<script lang="ts">
	import { onMount, afterUpdate } from 'svelte';
	import type { Socket } from 'socket.io-client';
	import { Context } from '$lib/components/Context.svelte';
	import { user } from '$lib/stores';


</script>

<div id="box">

</div>

<style lang="scss">
	#box {
		background: #c0c0c0;
		color: #000;
		font-family: 'MS Sans Serif', sans-serif;
		box-shadow: 1px 1px 5px 1px rgba(0, 0, 0, 0.5);
		width: 15rem;
		height: 17rem;
	}
</style>