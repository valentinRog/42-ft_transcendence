<script lang="ts">
	import { token } from '$lib/stores/stores';

	function handleSubmit(event: Event) {
		event.preventDefault();
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
				console.log(res);
				$token = res.access_token;
			})
			.catch((err) => console.log(err));
	}
</script>

<form
	on:submit={handleSubmit}
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

<form on:submit={handleSubmit}
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
