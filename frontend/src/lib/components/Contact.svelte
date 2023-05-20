<script lang="ts">
	import { token } from '$lib/stores/stores';

	export const url = '/mail.png';
	export const name = 'Contact';

	async function addFriend(event: Event) {
		const form = (event.target as HTMLFormElement).friend.value;
		console.log(form);
		const res = await fetch('http://localhost:3000/users/add-friend', {
			method: 'PATCH',
			headers: {
				Authorization: `Bearer ${$token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ friend: form })
		});
		return await res.json();
	}

	async function getMe() {
		const res = await fetch('http://localhost:3000/users/me', {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${$token}`
			}
		});
		const data = await res.json();
		console.log(data);
		return data;
	}
</script>

<div>
	<form on:submit|preventDefault={addFriend}>
		<label for="friend">Add Friend:</label>
		<input type="text" id="friend" name="friend" />
		<input type="submit" value="Add Friend" />
	</form>
	<button on:click={getMe}>Show friend in explorer (temp)</button>
</div>

<style lang="scss">
	div {
		width: 15rem;
		height: 15rem;
	}

	button,
	input[type='submit'] {
		margin: 0.25rem 0 0rem 0.5rem;
		padding: 0.15rem 0.25rem;
	}

	label {
		margin: 0.5rem;
	}

	#friend {
		background-color: $light-grey;

		&:focus {
			outline: none;
		}
	}
</style>
