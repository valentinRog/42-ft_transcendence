import { browser } from '$app/environment';
import { redirect } from '@sveltejs/kit';
import { token } from '$lib/stores/stores';
import { get } from 'svelte/store';

export async function load() {
	if (browser) {
		if (sessionStorage.getItem('token')) {
			token.set(sessionStorage.getItem('token'));
		}
		if (!get(token)) {
			throw redirect(302, '/login', { replace: true });
		}
	}
}
