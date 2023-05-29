import { token, socket, user } from '$lib/stores/stores';
import ioClient from 'socket.io-client';
import { goto } from '$app/navigation';
import { get } from 'svelte/store';

export function getUser() {
	fetch('http://localhost:3000/users/me', {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${get(token)}`
		}
	})
		.then((res) => res.json())
		.then((data) => {
			console.log(data);
			user.set({
				id: data.id,
				username: data.username,
				login: data.login
			});
		});
}

export function connectSocket() {
	let url = window.location.origin;
	url = url.substring(0, url.lastIndexOf(':'));
	const s = ioClient("localhost" + ':3000', {
		query: {
			token: get(token)
		}
	});
	socket.set(s);
}

export function logout() {
	sessionStorage.removeItem('token');
	token.set(null);
	get(socket)?.close();
	goto('/login');
}
