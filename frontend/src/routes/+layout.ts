import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { token } from '$lib/stores/stores';
import { connectSocket } from '$lib/scripts/connect';

if (browser && token.subscribe((val) => !val)) {
	const tok = sessionStorage.getItem('token');
	if (!tok) goto('/login');
	token.set(tok);
	connectSocket();
}
