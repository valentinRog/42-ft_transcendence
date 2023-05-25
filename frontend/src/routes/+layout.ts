import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { token, socket, user } from '$lib/stores/stores';
import { connectSocket } from '$lib/scripts/connect';
import { get } from 'svelte/store';

export function load({ fetch }) {
	if (browser) {
		const tok = sessionStorage.getItem('token');
		if (!tok) {
			goto('/login');
		} else if (get(socket) === null) {
			token.set(tok);
			fetch('http://localhost:3000/users/me', {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${get(token)}`
				}
			})
			.then((res) => res.json())
			.then((data) => {
				user.set({
					username: data.username,
					login: data.login
				});
			});
			connectSocket();
		}
	}
}
