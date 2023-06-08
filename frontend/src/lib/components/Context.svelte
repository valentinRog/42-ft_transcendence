<script lang="ts" context="module">
	import type { Readable, Writable } from 'svelte/store';
	import { getContext } from 'svelte';

	export namespace Context {
		export const fetchWithToken = (): ((url: string, options?: RequestInit) => Promise<Response>) =>
			getContext('fetchWithToken');

		export interface Contact {
			id: number;
			username: string;
			status: string;
		}

		type FriendRequest = {
			id: number;
			createdAt: string;
			sender: string;
			user: User;
			userId: number;
		};

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

		export interface User {
			id: number;
			username: string | null;
		}

		export const contacts = (): Writable<Contact[]> => getContext('contacts');
		export const friendRequest = (): Writable<FriendRequest[]> => getContext('friendRequest');
		export const openFriendRequest = (): Writable<boolean> => getContext('openFriendRequest');
		export const friendInfo = (): Writable<User | null> => getContext('friendInfo');
		export const chats = (): Writable<Chat[]> => getContext('chats');
		export const chatId = (): Writable<number | null> => getContext('chatId');
		export const openChatWindow = (): Writable<boolean> => getContext('openChatWindow');

		export type App = 'Pong' | 'Chat' | 'Contact' | 'Profile' | 'Conversation' | 'FriendRequest';

		export interface AppInstance {
			readonly componentType: App;
			readonly component: any;
			visible: boolean;
			readonly propsWin: Record<string, any>;
			readonly props: Record<string, any>;
		}

		export const components = (): Readable<Record<App, any>> => getContext('components');

		export const appInstances = (): Writable<Map<string, AppInstance>> => getContext('appInstances');
		export const selected = (): Writable<string | null> => getContext('selected');
		export const zstack = (): Writable<string[]> => getContext('zstack');

		export const addInstance = (): ((
			componentType: string,
			propsWin?: Record<string, any>,
			props?: Record<string, any>
		) => void) => getContext('addInstance');

		export const removeInstance = (): ((id: string) => void) => getContext('removeInstance');

		export const fetchMe = (): (() => Promise<any>) => getContext('fetchMe');
		export const fetchFriends = (): (() => Promise<any>) => getContext('fetchFriends');
		export const fetchFriendRequest = (): (() => Promise<any>) => getContext('fetchFriendRequest');
		export const fetchChats = (): (() => Promise<any>) => getContext('fetchChats');

		export const socket = (): Readable<Socket> => getContext('socket');
	}
</script>

<script lang="ts">
	import { writable, readable } from 'svelte/store';
	import { setContext } from 'svelte';
	import Pong from '$lib/components/app/Pong.svelte';
	import Chat from '$lib/components/app/Chat.svelte';
	import Contact from '$lib/components/app/Contact.svelte';
	import Profile from '$lib/components/app/Profile.svelte';
	import Conversation from '$lib/components/app/Conversation.svelte';
	import FriendRequest from '$lib/components/app/FriendRequest.svelte';
	import { token, user } from '$lib/stores';
	import { PUBLIC_BACKEND_URL } from '$env/static/public';
	import type { Socket } from 'socket.io-client';
	import ioClient from 'socket.io-client';
	import { onDestroy } from 'svelte';
	import { v4 as uuidv4 } from 'uuid';

	function fetchWithToken(route: string, options: RequestInit = {}) {
		return fetch(`${PUBLIC_BACKEND_URL}/${route}`, {
			...options,
			headers: {
				...options.headers,
				Authorization: `Bearer ${$token}`
			}
		});
	}

	setContext('fetchWithToken', fetchWithToken);

	const contacts = writable<Context.Contact[]>([]);
	const friendRequest = writable<Context.Contact[]>([]);
	const openFriendRequest = writable(false);
	const friendInfo = writable<Context.User | null>(null);
	const chats = writable<Context.Chat[]>([]);
	const chatId = writable<number | null>(null);
	const openChatWindow = writable(false);

	setContext('contacts', contacts);
	setContext('friendRequest', friendRequest);
	setContext('openFriendRequest', openFriendRequest);
	setContext('friendInfo', friendInfo);
	setContext('chats', chats);
	setContext('chatId', chatId);
	setContext('openChatWindow', openChatWindow);

	const components = readable({
		Pong: Pong,
		Chat: Chat,
		FriendRequest: FriendRequest,
		Contact: Contact,
		Profile: Profile,
		Conversation: Conversation
	});

	const appInstances = writable(new Map<string, Context.AppInstance>);
	const zstack = writable<string[]>([]);
	const selected = writable<string | null>(null);

	function addInstance(
		componentType: string,
		propsWin: Record<string, any> = {},
		props: Record<string, any> = {}
	) {
		const id = uuidv4();
		$zstack = [...$zstack, id];
		$appInstances.set(id,
		{
			componentType: componentType as Context.App,
			component: $components[componentType as Context.App],
			visible: true,
			propsWin,
			props
		});
		$appInstances = $appInstances;
	}

	function removeInstance(id: string) {
		$appInstances.delete(id);
		$appInstances = $appInstances;
		$zstack = $zstack.filter((z) => z !== id);
	}

	setContext('components', components);
	setContext('appInstances', appInstances);
	setContext('zstack', zstack);
	setContext('selected', selected);
	setContext('addInstance', addInstance);
	setContext('removeInstance', removeInstance);

	async function fetchMe() {
		const res = await fetchWithToken('users/me');
		const data = await res.json();
		$user = {
			id: data.id,
			username: data.username,
			login: data.login
		};
		return data;
	}

	async function fetchFriends() {
		const res = await fetchWithToken('users/me/friends');
		const data = await res.json();
		$contacts = data;
		return data;
	}

	async function fetchFriendRequest() {
		const res = await fetchWithToken('notification/get?type=friend');
		const data = await res.json();
		$friendRequest = data;
		return data;
	}

	async function fetchChats() {
		const res = await fetchWithToken('chat/allUserChats');
		const data = await res.json();
		$chats = data;
		return data;
	}

	setContext('fetchMe', fetchMe);
	setContext('fetchFriends', fetchFriends);
	setContext('fetchFriendRequest', fetchFriendRequest);
	setContext('fetchChats', fetchChats);

	const socket = readable<Socket>(
		ioClient(PUBLIC_BACKEND_URL, {
			query: {
				token: $token
			}
		})
	);

	$socket.on('friend', (data: { message: string }) => {
		console.log('add-friend', data.message);
	});

	$socket.on('game', (data: { message: string }) => {
		console.log('accept-game', data.message);
		$socket.emit('accept-game', { response: true, friend: data.message });
	});

	$socket.on('addChat', (chat) => {
		chats.update((chatsValue) => [...chatsValue, chat]);
		console.log($chats);
	});

	$socket.on('leaveChat', (chatId) => {
		$chats = $chats.filter((chat) => chat.id !== chatId);
	});

	$socket.on('message', ({ chatId, message }) => {
		let targetChatIndex = $chats.findIndex((chat) => chat.id === chatId);
		if (targetChatIndex !== -1) {
			let chatscopy = [...$chats];
			chatscopy[targetChatIndex].messages.push(message);
			$chats = chatscopy;
		} else {
			console.error(`Received message for unknown chat with id: ${chatId}`);
		}
	});

	setContext('socket', socket);

	onDestroy(() => {
		$socket.disconnect();
	});
</script>

<slot />
