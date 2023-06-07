import { token, socket } from '$lib/stores';
import ioClient from 'socket.io-client';
import { goto } from '$app/navigation';
import { get } from 'svelte/store';
import { PUBLIC_BACKEND_URL } from '$env/static/public';

export function connectSocket() {
	const s = ioClient(PUBLIC_BACKEND_URL, {
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
