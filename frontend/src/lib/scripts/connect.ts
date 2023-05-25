import { token, socket } from '$lib/stores/stores';
import ioClient from 'socket.io-client';
import { goto } from '$app/navigation';
import { get } from 'svelte/store';

export function connectSocket() {
	let url = window.location.origin;
	url = url.substring(0, url.lastIndexOf(':'));
	const s = ioClient(url + ':3000', {
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
