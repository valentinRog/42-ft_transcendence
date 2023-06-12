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

		export type NotifRequest = {
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
		export const friendRequest = (): Writable<NotifRequest[]> => getContext('friendRequest');
		export const gameRequest = (): Writable<NotifRequest[]> => getContext('gameRequest');
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
			readonly id: string;
			readonly propsWin: Record<string, any>;
			readonly props: Record<string, any>;
		}

		export const components = (): Writable<Record<App, any>> => getContext('components');
		export const appInstances = (): Writable<AppInstance[]> => getContext('appInstances');
		export const selected = (): Writable<number | null> => getContext('selected');
		export const zstack = (): Writable<number[]> => getContext('zstack');

		export const addInstance = (): ((
			componentType: string,
			propsWin?: Record<string, any>,
			props?: Record<string, any>
		) => void) => getContext('addInstance');

		export const fetchNotification = (): ((type: string) => number) => getContext('fetchNotification');

		export const fetchMe = (): (() => Promise<any>) => getContext('fetchMe');
		export const fetchFriends = (): (() => Promise<any>) => getContext('fetchFriends');
		export const fetchFriendRequest = (): (() => Promise<any>) => getContext('fetchFriendRequest');
		export const fetchGameRequest = (): (() => Promise<any>) => getContext('fetchGameRequest');
		export const fetchChats = (): (() => Promise<any>) => getContext('fetchChats');

		export const socket = (): Readable<Socket> => getContext('socket');

		export const getUnreadMessagesCount = (): ((chat: any, chatUser: any) => number) =>
			getContext('getUnreadMessagesCount');
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
	const friendRequest = writable<Context.NotifRequest[]>([]);
	const gameRequest = writable<Context.NotifRequest[]>([]);
	const openFriendRequest = writable(false);
	const friendInfo = writable<Context.User | null>(null);
	const chats = writable<Context.Chat[]>([]);
	const chatId = writable<number | null>(null);
	const openChatWindow = writable(false);

	setContext('contacts', contacts);
	setContext('friendRequest', friendRequest);
	setContext('gameRequest', gameRequest);
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

	const appInstances = writable<Context.AppInstance[]>([]);
	const zstack = writable<number[]>([]);
	const selected = writable<number | null>(null);

	function addInstance(
		componentType: string,
		propsWin: Record<string, any> = {},
		props: Record<string, any> = {}
	) {
		$zstack = [...$zstack, $zstack.length];
		$appInstances = [
			...$appInstances,
			{
				componentType: componentType as Context.App,
				component: $components[componentType as Context.App],
				visible: true,
				id: uuidv4(),
				propsWin,
				props
			}
		];
	}

	setContext('components', components);
	setContext('appInstances', appInstances);
	setContext('zstack', zstack);
	setContext('selected', selected);
	setContext('addInstance', addInstance);

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

	async function fetchNotification(type : string) {
		const res = await fetchWithToken('notification/get?type=' + type);
		const data = await res.json();
		return data.size;
	}

	setContext('fetchNotification', fetchNotification);

	async function fetchFriendRequest() {
		const res = await fetchWithToken('notification/get?type=friend');
		const data = await res.json();
		$friendRequest = data;
		console.log(data);
		return data;
	}

	async function fetchGameRequest() {
		const res = await fetchWithToken('notification/get?type=ask-game');
		const data = await res.json();
		$gameRequest = data;
		return data;
	}

	setContext('fetchGameRequest', fetchGameRequest);

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

	// ------- EVENTS --------

	$socket.on('friend', (data: { message: string }) => {
		console.log('add-friend', data.message);
		fetchFriendRequest();
	});

	$socket.on('game', (data: { message: string }) => {
		console.log('accept-game', data.message);
		$socket.emit('accept-game', { response: true, friend: data.message });
		fetchGameRequest();
	});

	$socket.on('addChat', (chat) => {
		chats.update((chatsValue) => [...chatsValue, chat]);
		console.log($chats);
	});

	$socket.on('leaveChat', (chatId) => {
		$chats = $chats.filter((chat) => chat.id !== chatId);
	});

	$socket.on('updateChatName', ({ chatId, newName }) => {
		let targetChatIndex = $chats.findIndex((chat) => chat.id === chatId);
		if (targetChatIndex !== -1) {
			let chatscopy = [...$chats];
			chatscopy[targetChatIndex].name = newName;
			$chats = chatscopy;
		} else {
			console.error(`Received message for unknown chat with id: ${chatId}`);
		}
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

	// ------- END EVENTS --------

	setContext('socket', socket);

	onDestroy(() => {
		$socket.disconnect();
	});

	function getUnreadMessagesCount(chat: any, chatUser: any) {
		if (chat.messages.length > 0) {
			const lastReadMessageId = chatUser.lastReadMessageId || 0;
			const unreadMessages = chat.messages.filter((message: any) => message.id > lastReadMessageId);
			const unreadCount = unreadMessages.length;

			return unreadCount > 99 ? '99+' : unreadCount;
		} else {
			return 0;
		}
	}

	setContext('getUnreadMessagesCount', getUnreadMessagesCount);
</script>

<slot />
