import { writable } from 'svelte/store';
import type { Socket } from 'socket.io-client';

export const token = writable<string | null>(null);
export const socket = writable<Socket | null>(null);

import { readable } from 'svelte/store';

export const time = readable(new Date(), function start(set) {
	const interval = setInterval(() => {
		set(new Date());
	}, 1000);

	return function stop() {
		clearInterval(interval);
	};
});
// c du js ? est-ce que ca passe en ts ?
