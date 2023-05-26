import { writable } from 'svelte/store';
import type { Socket } from 'socket.io-client';
import Pong from '$lib/components/pong/Pong.svelte';
import ChatWindow from '$lib/components/ChatWindow.svelte';
import Contact from '$lib/components/Contact.svelte';
import Profile from '$lib/components/Profile.svelte';

// TIME
export const token = writable<string | null>(null);
export const socket = writable<Socket | null>(null);
export const openChatWindow = writable(false);

import { readable } from 'svelte/store';
import type { AppInstance } from '$lib/types/types';

export const time = readable(new Date(), function start(set) {
	const interval = setInterval(() => {
		set(new Date());
	}, 1000);

	return function stop() {
		clearInterval(interval);
	};
});

// APP INSTANCE

export const appInstances = writable<AppInstance[]>([]);
export const zstack = writable<number[]>([]);
export const gid = writable(0);
export const selected = writable<number | null>(0);

// COMPONENTS

export const components = readable({
	Pong: Pong,
	ChatWindow: ChatWindow,
	Contact: Contact,
	Profile: Profile
});

// USER

export const user = writable<{ username: string; login: string } | null>(null);

// CHAT
export const chatRecipient = writable('');
export const messagesStore = writable<MessagesStoreType>({});

type MessagesStoreType = {
    [key: string]: string[];
};