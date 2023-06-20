import { writable } from 'svelte/store';

export const token = writable<string | null>(null);
export const user = writable<{
	id: number;
	username: string;
	login: string;
	twoFactorEnabled: boolean;
	logFrom42: boolean;
} | null>(null);
export const loading = writable<boolean>(false);