<script lang="ts">
	import { goto } from '$app/navigation';
	import { token } from '$lib/stores/stores';

	export let color: string;
	export const url = '/mail.png';
	export const name = 'Chat';

	function logout() {
		sessionStorage.removeItem('token');
		token.set(null);
		goto('/login');
	}
</script>

<div style="background-color: {color};">
	<button on:click={logout}>Logout</button>
</div>

<style lang="scss">
	div {
		width: 15rem;
		height: 15rem;

		button {
			margin-left: 0.25rem;
		}
	}
</style>
