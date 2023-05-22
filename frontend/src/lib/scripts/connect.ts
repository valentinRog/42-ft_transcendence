import { token, socket } from '$lib/stores/stores';
import ioClient from 'socket.io-client';

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
