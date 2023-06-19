<script lang="ts">
	import { Context } from '$lib/components/Context.svelte';
	import { token } from '$lib/stores';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { user } from '$lib/stores';
	import { PUBLIC_BACKEND_URL } from '$env/static/public';
	import ErrorDialog from '$lib/components/ErrorDialog.svelte';

	const fetchWithToken = Context.fetchWithToken();
	const addInstance = Context.addInstance();
	const fetchMe = Context.fetchMe();

	onMount(() => {
		if ($page.url.searchParams.get('token')) {
			$token = $page.url.searchParams.get('token');
			if (browser) sessionStorage.setItem('token', $token!);
			goto('/', { replaceState: true });
		}
	});

	let showModal = false;
	let errorMessage: string | null = null;

	let changes = false;

	let inputLogin = $user?.login;
	let inputUsername = $user?.username;

	let checkboxValue = $user?.twoFactorEnabled;

	async function handleSubmit(event: Event) {
		const form = event.target as HTMLFormElement;
		const data = new FormData(form);
		const body = new URLSearchParams();
		for (const pair of data) {
			body.append(pair[0], pair[1] as string);
		}
		const res = await fetch( `${PUBLIC_BACKEND_URL}/users/edit`, {
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

	async function enable2fa() {
		const res = await fetchWithToken('2fa/enable', {
			method: 'POST'
		});
		const data = await res.json();
		addInstance('Internet', {}, { url: data.qrcode });
		$token = data.token;
		sessionStorage.setItem('token', data.token);
		fetchMe();
	}

	async function disable2fa() {
		await fetchWithToken('users/edit', {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				twoFactorEnabled: false
			})
		});
		fetchMe();
	}

	function handleChange() {
		changes = inputLogin !== $user?.login || inputUsername !== $user?.username || checkboxValue !== $user?.twoFactorEnabled;
	}

</script>

<div class="window-body">
	<ErrorDialog {showModal} {errorMessage} on:close={() => (showModal = false)} />
		<div id="formular">
		<div class="content">
			<form
				on:submit|preventDefault={handleSubmit}
				method="post"
				enctype="application/x-www-form-urlencoded"
			>
				<div class="form-group">
						<label for="username">Username:</label>
						<input type="text" id="username" name="username" bind:value="{inputUsername}" on:input="{handleChange}" />
				</div>
				{#if !$user?.logFrom42}
					<div class="form-group">
						<label for="login">Login:</label>
						<input type="text" id="login" name="login" bind:value="{inputLogin}" on:input="{handleChange}"/>
					</div>
					<input type="checkbox" id="2fa" bind:checked="{checkboxValue}" on:change="{handleChange}">
					<label for="2fa">2fa</label>
				{/if}
				{#if changes}
				<button type="submit">Save</button>
				{:else}
				<button disabled type="submit">Save</button>
				{/if}
			</form>
		</div>
	</div>
</div>


<style lang="scss">

	div#formular {
		@include checkbox;
		@include form-95;
		@include tab-border($dark-grey, $light-grey);

		padding: 0.2rem;
		background-color: $grey;
		form {
			@include tab-border($light-grey, $dark-grey);
			display: flex;
			flex-direction: column;
			gap: 0.8rem;
			padding: 1rem;
			width: 18rem;
			margin-top: 0.2rem;

			label {
				color: black;
				width: 7rem;
			}
		}

		.form-group {
			display: flex;
			align-items: center;
		}

		button {
			@include tab-contour;
			@include tab-contour-active;
			width: 4rem;
			height: 1.5rem;
			font-size: 1rem;
			align-self: center;
		}
	}

</style>
