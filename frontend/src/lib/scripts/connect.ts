import { token, socket } from '$lib/stores/stores';
import ioClient from 'socket.io-client';
import { goto } from '$app/navigation';

export function connectSocket() {
	let url = window.location.origin;
	url = url.substring(0, url.lastIndexOf(':'));
	let tok;
	const unsub = token.subscribe((val) => (tok = val));
	const s = ioClient(url + ':3000', {
		query: {
			token: tok
		}
	});
	unsub();
	socket.set(s);
}

export function logout() {
	sessionStorage.removeItem('token');
	token.set(null);
	socket.subscribe((val) => {
		val?.close();
	});
	goto('/login');
}
