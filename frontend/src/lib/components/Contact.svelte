<script lang="ts">
	import { goto } from '$app/navigation';
	import { token } from '$lib/stores/stores';

	export let color: string;
	export const url = '/mail.png';
	export const name = 'Contact';

	function logout() {
		localStorage.removeItem('token');
		token.set(null);
		goto('/login');
	}

	async function addFriend(event: Event) {
		const form = (event.target as HTMLFormElement).friend.value;
		console.log(form);
  		const res = await fetch('http://localhost:3000/users/add-friend', {
    	method: 'PATCH',
    	headers: {
      		'Authorization': `Bearer ${$token}`,
      		'Content-Type': 'application/json'
    	},
    	body: JSON.stringify({ friend: form })
  		});
  		return await res.json();
	}

	async function getMe() {
		const res = await fetch("http://localhost:3000/users/me", {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${$token}`,
			}
		});
		const data = await res.json();
		console.log(data);
		return data;
	}

	async function printFriend() {

	}
</script>

<div style="background-color: {color};">
	<form on:submit|preventDefault={addFriend}>
		<label for="friend">Add Friend:</label>
		<input type="text" id="friend" name="friend">
		<input type="submit" value="Add Friend">
	</form>
</div>

<button on:click={()=>{
	getMe()
}}>show friend in explorer(temp)</button>

<style lang="scss">
	div {
		width: 15rem;
		height: 15rem;
	}
</style>
