import { token } from '$lib/stores/stores';
import { get } from 'svelte/store';
import { PUBLIC_BACKEND_URL } from '$env/static/public';

export async function getWithToken(route: string) {
	const res = await fetch(`${PUBLIC_BACKEND_URL}/${route}`, {
		headers: {
			Authorization: `Bearer ${get(token)}`
		}
	});
	return await res.json();
}
