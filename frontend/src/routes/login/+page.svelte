<script lang="ts">
	import { token } from '$lib/stores';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { PUBLIC_BACKEND_URL } from '$env/static/public';
	import ErrorDialog from '$lib/components/ErrorDialog.svelte';

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
			showModal = true;
		} else if (json.access_token) {
			$token = json.access_token;
			if (browser) sessionStorage.setItem('token', json.access_token);
			goto('/');
		}
	}

	let actionUrl = `${PUBLIC_BACKEND_URL}/auth/signin`;
	function updateActionUrl() {
		actionUrl = signup ? `${PUBLIC_BACKEND_URL}/auth/signup` : `${PUBLIC_BACKEND_URL}/auth/signin`;
	}
	let showModal = false;
</script>

<div id="login">
	<ErrorDialog {showModal} {errorMessage} on:close={() => (showModal = false)} />
	<div id="formular">
		<div class="top-bar">
			<div class="buttons">
				<button>&nbsp?&nbsp</button>
				<button>&nbspX&nbsp</button>
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
					<div class="row-icon"><img src="/user.png" /></div>
					<label for="login">Login:</label>
					<input type="text" id="login" name="login" />
				</div>
				<div class="form-group">
					<div class="row-icon"><img src="/keys-3.png" /></div>
					<label for="password">Password:</label>
					<input type="password" id="password" name="password" />
				</div>
				{#if !signup}
					<div class="form-group">
						<div class="row-icon"><img src="/padlock.png" /></div>
						<label for="twoFactor">2FA:</label>
						<input type="text" id="twoFactor" name="twoFactor" />
					</div>
				{:else}
					<div class="form-group">
						<div class="row-icon"><img src="/agent.png" /></div>
						<label for="username">Username:</label>
						<input type="text" id="username" name="username" />
					</div>
				{/if}
				<div class="button-container">
					<button
						type="button"
						on:click={() => {
							signup = !signup;
							updateActionUrl();
						}}>{signup ? 'I have an account' : 'Create an account'}</button
					>
					<button type="submit"
					>{#if signup}Sign Up{:else}Sign In{/if}</button
					>
					<div class="login-42">
						<a href="{PUBLIC_BACKEND_URL}/auth/42login">Login with 
							<img src="/422.png"/>
						</a>
					</div>
				</div>
			</form>
			
		</div>
	</div>
</div>

<style lang="scss">
	div#formular {

		@include form-95;
		background-color: $grey;
		form {
			display: flex;
			flex-direction: column;
			gap: 0.8rem;
			padding: 1rem;
			width: 25rem;
			margin-top: 1rem;

			.row-icon img {
				margin-right: 10px;
				width: 25px;
				height: 25px;
			}
			label {
				color: black;
				width: 7rem;
			}
		}
		
		.form-group {
			display: flex;
			align-items: center;
		}
	}
	
	div#login {
		@include tab-contour;
		background-color: $grey;
		width: fit-content;
		margin: 0 auto;
		margin-top: 10rem;
		
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
			flex-direction: column;
			align-items: center;
			gap: 0.5rem;
			margin-top: 1rem;
			.login-42 {
				display: flex;
				align-items: center;
				a {
					@include tab-border;
					color: black;
					background-color: $light-grey;
					text-decoration: none;
					height: 1.8rem;
					width: 10rem;
					// padding: 0.3rem 1rem;
					img {
						height: 1rem;
						width: auto;
	
					}
				}
			}
		}
		
		.button-container button {
			font-size: inherit;
			padding: 0.3rem 1rem;
			width: 10rem;
		}

		div.content {
			padding: 1rem;
			a {
				display: block;
				text-align: center;
			}
		}
	}
</style>
