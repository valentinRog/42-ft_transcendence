import { writable } from 'svelte/store';
import type { Socket } from 'socket.io-client';
import Pong from '$lib/components/desktop/app/pong/Pong.svelte';
import ChatWindow from '$lib/components/desktop/app/ChatWindow.svelte';
import Contact from '$lib/components/desktop/app/Contact.svelte';
import Profile from '$lib/components/desktop/app/Profile.svelte';
import Conversation from '$lib/components/desktop/app/Conversation.svelte';

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
	Profile: Profile,
	Conversation: Conversation
});

// USER

export const user = writable<{ id: number; username: string; login: string } | null>(null);

// CONTACTS
export const contacts = writable<Contact[]>([]);

export interface Contact {
	id: number;
	username: string;
	status: string;
}

// NOTIFICATIONS
//export const notifications = writable<Notif[]>([]);

// CHAT
export const friendInfo = writable<User | null>(null);
export const chats = writable<Chat[]>([]);
export const chatId = writable<number | null>(null);

export type Chat = {
	chatUsers: ChatUser[];
	messages: Message[];
	createdAt: string;
	id: number;
	isGroupChat: boolean;
	name: string;
	updatedAt: string;
};

type ChatUser = {
	chatId: number;
	createdAt: string;
	id: number;
	lastReadMessageId: number | null;
	user: User;
	userId: number;
};

interface Message {
	chatId: number;
	content: string;
	createdAt: string;
	id: number;
	updatedAt: string;
	userId: number;
}

interface User {
	id: number;
	username: string | null;
}
