import { browser } from '$app/environment';
import { token } from '$lib/stores/stores';

if (browser) {
	const tok = localStorage.getItem('token');
	if (tok) {
		token.set(tok);
	}
}
