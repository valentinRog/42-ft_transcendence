import { browser } from '$app/environment';
import { token, user } from '$lib/stores';

export function load() {
	if (browser) {
		sessionStorage.removeItem('token');
	}
	token.set(null);
	user.set(null);
}
