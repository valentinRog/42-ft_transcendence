<script lang="ts">
	import { goto } from '$app/navigation';
	import { token } from '$lib/stores/stores';

	function logout() {
		sessionStorage.removeItem('token');
		token.set(null);
		goto('/login');
	}
</script>

<div>
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
