import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { token, socket } from '$lib/stores/stores';
import ioClient from 'socket.io-client';

if (browser && token.subscribe((val) => !val)) {
	const tok = localStorage.getItem('token');
	if (!tok) goto('/login');
	token.set(tok);
	let url = window.location.origin;
	url = url.substring(0, url.lastIndexOf(':'));
	socket.set(ioClient(url + ':3000'));
}
