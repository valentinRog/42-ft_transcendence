import { browser } from '$app/environment';
import { token } from '$lib/stores/stores';
import { get } from 'svelte/store';
import { goto } from '$app/navigation';

export async function load() {
	console.log('yo');
	if (browser) {
		if (sessionStorage.getItem('token')) token.set(sessionStorage.getItem('token'));
		if (!get(token)) goto('/login', { replaceState: true });
	}
}
