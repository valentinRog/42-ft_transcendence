import { writable } from 'svelte/store';

export const token = writable<string | null>(null);

export type User = {
	id: number;
	username: string;
	login: string;
	twoFactorEnabled: boolean;
	createdAt: Date;
	friends: number[];
	logFrom42: boolean;
};

export const user = writable<User>();
export const loading = writable<boolean>(false);
