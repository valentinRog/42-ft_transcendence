import { browser } from '$app/environment';
import { redirect } from '@sveltejs/kit';
import { token } from '$lib/stores/stores';

export async function load() {
	if (browser) {
		const tok = sessionStorage.getItem('token');
		if (!tok) {
			throw redirect(302, '/login');
		}
		token.set(tok);
	}
}
