<script lang="ts">
	import { Context } from '$lib/components/Context.svelte';
	import { token } from '$lib/stores';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
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

</script>

<!--<div class="window-body">
	<ErrorDialog {showModal} {errorMessage} on:close={() => (showModal = false)} />
	<div id="formular">
		<div class="content">
			<form
				on:submit|preventDefault={handleSubmit}
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
				<div class="form-group">
						<div class="row-icon"><img src="/agent.png" /></div>
						<label for="username">Username:</label>
						<input type="text" id="username" name="username" />
				</div>
				<button type="submit">Submit Changes</button>

			</form>
		</div>
	</div>
</div>-->

<input type="checkbox" id="example1">
<label for="example1">2fa</label>

<style lang="scss">
	@include checkbox;
</style>
