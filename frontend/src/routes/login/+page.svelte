<script lang="ts">
	import { token } from '$lib/stores/stores';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { PUBLIC_BACKEND_URL } from '$env/static/public';

	onMount(() => {
		if ($page.url.searchParams.get('token')) {
			$token = $page.url.searchParams.get('token');
			if (browser) sessionStorage.setItem('token', $token!);
			goto('/', { replaceState: true });
		}
	});

	let errorMessage: string | null = null;
	let signup = false;

	async function handleSubmit(event: Event) {
		const form = event.target as HTMLFormElement;
		const data = new FormData(form);
		const body = new URLSearchParams();
		for (const pair of data) {
			body.append(pair[0], pair[1] as string);
		}
		const res = await fetch(form.action, {
			method: form.method,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body
		});
		const json = await res.json();
		console.log(json);
		if (res.status !== 200 && res.status !== 201) {
			errorMessage = json.message;
		} else if (json.access_token) {
			$token = json.access_token;
			if (browser) sessionStorage.setItem('token', json.access_token);
			goto('/');
		}
	}
</script>

<div id="login">
	<div class="top-bar">
		<div class="buttons">
			<button>?</button>
			<button>X</button>
		</div>
	</div>
	<div class="content">
		{#if signup}
			<form
				on:submit|preventDefault={handleSubmit}
				action="{PUBLIC_BACKEND_URL}/auth/signup"
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
		{:else}
			<form
				on:submit|preventDefault={handleSubmit}
				action="{PUBLIC_BACKEND_URL}/auth/signin"
				method="post"
				enctype="application/x-www-form-urlencoded"
			>
				<label for="login">Login</label>
				<input type="text" id="login" name="login" placeholder="login" />
				<label for="password">Password</label>
				<input type="password" id="password" name="password" placeholder="password" />
				<label for="twoFactor">2FA</label>
				<input type="text" id="twoFactor" name="twoFactor" placeholder="2FA" />
				<input type="submit" value="Signin" />
			</form>
		{/if}
		{#if errorMessage}
			<p><strong>{errorMessage}</strong></p>
		{/if}
		<button
			on:click={() => {
				signup = !signup;
				errorMessage = null;
			}}>{signup ? 'I have an account' : 'Create an account'}</button
		>
		<a href="{PUBLIC_BACKEND_URL}/auth/42login">login with 42</a>
	</div>
</div>

<style lang="scss">
	div#login {
		@include tab-contour;
		background-color: $grey;
		display: block;
		width: fit-content;
		margin: 0 auto;
		margin-top: 5rem;

		div.top-bar {
			background-color: $blue;
			height: 1.5rem;
			display: flex;
			align-items: center;

			.buttons {
				margin-left: auto;
				margin-right: 0.2rem;
			}
		}

		form {
			display: flex;
			flex-direction: column;
			gap: 0.5rem;
			padding: 1rem;
			width: 20rem;
			margin-top: 1rem;

			input[type='submit'] {
				width: fit-content;
				margin-top: 1rem;
				align-self: flex-end;
			}
		}

		div.content {
			padding: 1rem;

			strong {
				color: red;
			}

			a {
				display: block;
				text-align: center;
			}
		}
	}
</style>
