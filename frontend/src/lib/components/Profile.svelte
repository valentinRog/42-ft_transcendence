<script lang="ts">
	import { token } from '$lib/stores/stores';

	let me = fetch('http://localhost:3000/users/me', {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${$token}`
		}
	})
		.then((res) => res.json())
		.then((data) => data);
	me.then((data) => console.log(data));
</script>

{#await me then data}
	<ul>
		<li>Username: {data.username}</li>
		<li>Login: {data.login}</li>
	</ul>
{/await}

<style lang="scss">
	li {
		list-style: none;
	}
</style>
