import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { token } from '$lib/stores/stores';
import { connectSocket } from '$lib/scripts/connect';

export function load() {
	if (browser) {
		const tok = sessionStorage.getItem('token');
		if (!tok) goto('/login');
		token.set(tok);
		connectSocket();
	}
}
