<script lang="ts">
	import { token } from '$lib/stores';
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

	let actionUrl = signup ? `${PUBLIC_BACKEND_URL}/auth/signup` : `${PUBLIC_BACKEND_URL}/auth/signin`;
</script>

<div id="login">
	<div class="top-bar">
		<div class="buttons">
			<button>?</button>
			<button>X</button>
		</div>
	</div>
	<div class="content">
		<form
			on:submit|preventDefault={handleSubmit}
			action={actionUrl}
			method="post"
			enctype="application/x-www-form-urlencoded"
			>
			<div class="form-group">
				<div class="row-icon"><img src="/user.png"></div>
				<label for="login">Login:</label>
				<input type="text" id="login" name="login"/>
			</div>
			<div class="form-group">
				<div class="row-icon"><img src="/keys-3.png"></div>
				<label for="password">Password:</label>
				<input type="password" id="password" name="password"/>
			</div>
			{#if !signup}
			<div class="form-group">
				<div class="row-icon"><img src="/padlock.png"></div>
				<label for="twoFactor">2FA:</label>
				<input type="text" id="twoFactor" name="twoFactor"/>
				</div>
			{:else}
			<div class="form-group">
				<div class="row-icon"><img src="/agent.png"></div>
				<label for="username">Username:</label>
				<input type="text" id="username" name="username"/>
				</div>
			{/if}
			<div class="button-container">
				<button
				on:click={() => {
					signup = !signup;
				}}>{signup ? 'I have an account' : 'Create an account'}</button>
				<button type="submit">{#if signup}Sign Up{:else}Sign In{/if}</button>
			</div>
		</form>
		<a href="{PUBLIC_BACKEND_URL}/auth/42login">login with 42</a>


	</div>
</div>

<style lang="scss">

	div#login {

		form {
			display: flex;
			flex-direction: column; /* Align form-rows vertically */
			align-items: left; /* Vertically align form-row elements */
			gap: 0.5rem;
			padding: 1rem;
			width: 25rem;
			margin-top: 1rem;

			.row-icon img {
				margin-right: 10px;
				width: 25px;
 			    height: 25px;
			}

			label {
				width: 7rem;
			}
		}

		.form-group {
			display: flex;
			align-items: center;
		}

		input {
			@include form-95;
  			margin-left: 10px; /* Add a gap between label and input field */
		}

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

		.button-container {
			display: flex;
			justify-content: center;
			align-items: center;
			gap: 0.5rem;
			margin-top: 1rem;
		}

		.button-container button {
			font-size: inherit;
			padding: 0.3rem 1rem; /* Adjust the padding as desired */
			width: 10rem; /* Adjust the width as desired */

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
