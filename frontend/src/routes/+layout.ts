import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { token, socket } from '$lib/stores/stores';
import { connectSocket } from '$lib/scripts/connect';
import type { Socket } from 'socket.io-client';

export function load() {
	if (browser) {
		const tok = sessionStorage.getItem('token');
		let sock: Socket | null = null;
		socket.subscribe((val) => {
			sock = val;
		});
		if (!tok) {
			goto('/login');
		} else if (sock === null) {
			token.set(tok);
			connectSocket();
		}
	}
}
