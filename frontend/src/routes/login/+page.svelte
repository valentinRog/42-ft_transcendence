<script lang="ts">
	import { token, socket } from '$lib/stores/stores';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import ioClient from 'socket.io-client';

	onMount(() => {
		if ($token) goto('/');
		if ($page.url.searchParams.get('token')) {
			$token = $page.url.searchParams.get('token');
			if (browser) localStorage.setItem('token', $token!);
			goto('/');
		}
	});

	function handleSubmit(event: Event) {
		const form = event.target as HTMLFormElement;
		const data = new FormData(form);
		const body = new URLSearchParams(data);
		fetch(form.action, {
			method: form.method,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body
		})
			.then((res) => res.json())
			.then((res) => {
				if (!res.access_token) return;
				$token = res.access_token;
				if (browser) localStorage.setItem('token', res.access_token);
				let url = window.location.origin;
				url = url.substring(0, url.lastIndexOf(':'));
				$socket = ioClient(url + ':3000');
				goto('/');
			})
			.catch((err) => console.log(err));
	}
</script>

<form
	on:submit|preventDefault={handleSubmit}
	action="http://localhost:3000/auth/signup"
	method="post"
	enctype="application/x-www-form-urlencoded"
>
	<label for="username">Username</label>
	<input type="text" id="username" name="username" placeholder="username" />
	<label for="login">Login</label>
	<input type="text" id="login" name="login" placeholder="login" />
	<label for="password">Password</label>
	<input type="password" id="password" name="password" placeholder="password" />
	<input type="submit" value="Sign Up" />
</form>

<form
	on:submit|preventDefault={handleSubmit}
	action="http://localhost:3000/auth/signin"
	method="post"
	enctype="application/x-www-form-urlencoded"
>
	<label for="login">Login</label>
	<input type="text" id="login" name="login" placeholder="login" />
	<label for="password">Password</label>
	<input type="password" id="password" name="password" placeholder="password" />
	<input type="submit" value="Signin" />
</form>

<a href="http://localhost:3000/auth/42login">login with 42</a>
