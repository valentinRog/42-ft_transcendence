<script lang="ts" context="module">
	import type { Readable, Writable } from 'svelte/store';
	import { getContext } from 'svelte';

	export namespace Context {
		export const fetchWithToken = (): ((url: string, options?: RequestInit) => Promise<Response>) =>
			getContext('fetchWithToken');

		export type Match = {
			result: string;
			opponent: string;
			createdAt: string;
		};
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
			accessibility: string;
			password: string;
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
		export const history = (): Writable<Match[]> => getContext('history');
		export const openFriendRequest = (): Writable<boolean> => getContext('openFriendRequest');
		export const openEditProfile = (): Writable<boolean> => getContext('openEditProfile');
		export const openPongWindow = (): Writable<boolean> => getContext('openPongWindow');
		export const friendInfoId = (): Writable<number | null> => getContext('friendInfoId');
		export const chats = (): Writable<Chat[]> => getContext('chats');
		export const chatsPublic = (): Writable<Chat[]> => getContext('chatsPublic');
		export const chatId = (): Writable<number | null> => getContext('chatId');
		export const openChatWindow = (): Writable<boolean> => getContext('openChatWindow');
		export const openChatForumWindow = (): Writable<boolean> => getContext('openChatForumWindow');

		export interface Settings {
			up: string;
			down: string;
		}

		export const settings = (): Writable<Settings> => getContext('settings');
		export const soundOn = (): Writable<boolean> => getContext('soundOn');

		export const fetchSettings = (): (() => Promise<any>) => getContext('fetchSettings');

		export type App =
			| 'Pong'
			| 'Paint'
			| 'Chat'
			| 'ChatForum'
			| 'Contact'
			| 'Profile'
			| 'Conversation'
			| 'Forum'
			| 'FriendRequest'
			| 'Internet'
			| 'Notepad'
			| 'EditProfile'
			| 'PongKeybinds';

		export interface AppInstance {
			readonly componentType: App;
			readonly component: any;
			visible: boolean;
			readonly propsWin: Record<string, any>;
			readonly props: Record<string, any>;
		}

		export const components = (): Readable<Record<App, any>> => getContext('components');

		interface Props {
			readonly name: string;
			readonly icon: string;
		}

		export interface AppProps {
			readonly TabProps: Props;
			readonly DesktopProps: Props;
		}

		export const apps = (): Readable<Record<App, AppProps>> => getContext('apps');

		export const appInstances = (): Writable<Map<string, AppInstance>> =>
			getContext('appInstances');
		export const selected = (): Writable<string | null> => getContext('selected');
		export const zstack = (): Writable<string[]> => getContext('zstack');

		export const addInstance = (): ((
			componentType: string,
			propsWin?: Record<string, any>,
			props?: Record<string, any>
		) => void) => getContext('addInstance');

		export const removeInstance = (): ((id: string) => void) => getContext('removeInstance');

		export const fetchHistory = (): (() => Promise<any>) => getContext('fetchHistory');
		export const fetchMe = (): (() => Promise<any>) => getContext('fetchMe');
		export const fetchUserByUsername = (): ((username: string) => Promise<any>) =>
			getContext('fetchUserByUsername');
		export const fetchFriends = (): (() => Promise<any>) => getContext('fetchFriends');
		export const fetchFriendRequest = (): (() => Promise<any>) => getContext('fetchFriendRequest');
		export const fetchGameRequest = (): (() => Promise<any>) => getContext('fetchGameRequest');
		export const fetchChats = (): (() => Promise<any>) => getContext('fetchChats');
		export const fetchChatById = (): ((chatId: number) => Promise<any>) =>
			getContext('fetchChatById');
		export const fetchPublicChats = (): ((start: number, limit: number) => Promise<any>) =>
			getContext('fetchPublicChats');
		export const fetchVerifyPassword = (): ((chatId: number, password: string) => Promise<any>) =>
			getContext('fetchVerifyPassword');
		export const fetchCreateChat = (): ((
			memberUsernames: any,
			isGroupChat: any,
			accessibility: string,
			password?: string
		) => Promise<any>) => getContext('fetchCreateChat');

		export const socket = (): Readable<Socket> => getContext('socket');

		export const getUnreadMessagesCount = (): ((chat: any, chatUser: any) => number) =>
			getContext('getUnreadMessagesCount');
	}
</script>

<script lang="ts">
	import { writable, readable } from 'svelte/store';
	import { setContext } from 'svelte';
	import Pong from '$lib/components/app/pong/Pong.svelte';
	import Paint from '$lib/components/app/Paint.svelte';
	import Chat from '$lib/components/app/Chat.svelte';
	import ChatForum from '$lib/components/app/ChatForum.svelte';
	import Contact from '$lib/components/app/Contact.svelte';
	import Profile from '$lib/components/app/Profile/Profile.svelte';
	import Forum from '$lib/components/app/Forum.svelte';
	import Conversation from '$lib/components/app/Conversation.svelte';
	import Internet from '$lib/components/app/Internet.svelte';
	import Notepad from '$lib/components/app/Notepad.svelte';
	import FriendRequest from '$lib/components/app/FriendRequest.svelte';
	import EditProfile from './app/EditProfile.svelte';
	import PongKeybinds from '$lib/components/app/pong/PongKeybinds.svelte';
	import { token, user, loading } from '$lib/stores';
	import { PUBLIC_BACKEND_URL } from '$env/static/public';
	import type { Socket } from 'socket.io-client';
	import ioClient from 'socket.io-client';
	import { onDestroy } from 'svelte';
	import { v4 as uuidv4 } from 'uuid';
	import { logout } from '$lib/utils/connect';

	function fetchWithToken(route: string, options: RequestInit = {}): Promise<Response> {
		$loading = true;
		const res = fetch(`${PUBLIC_BACKEND_URL}/${route}`, {
			...options,
			headers: {
				...options.headers,
				Authorization: `Bearer ${$token}`
			}
		});
		res.then((resp) => {
			$loading = false;
			if (resp.status === 401) logout();
		});
		return res;
	}

	setContext('fetchWithToken', fetchWithToken);

	const contacts = writable<Context.Contact[]>([]);
	const friendRequest = writable<Context.NotifRequest[]>([]);
	const gameRequest = writable<Context.NotifRequest[]>([]);
	const history = writable<Context.Match[]>([]);
	const openFriendRequest = writable(false);
	const openEditProfile = writable(false);
	const openPongWindow = writable(false);
	const friendInfoId = writable<Context.User | null>(null);
	const chats = writable<Context.Chat[]>([]);
	const chatsPublic = writable<Context.Chat[]>([]);
	const chatId = writable<number | null>(null);
	const openChatWindow = writable(false);
	const openChatForumWindow = writable(false);

	setContext('contacts', contacts);
	setContext('friendRequest', friendRequest);
	setContext('gameRequest', gameRequest);
	setContext('history', history);
	setContext('openFriendRequest', openFriendRequest);
	setContext('openEditProfile', openEditProfile);
	setContext('openPongWindow', openPongWindow);
	setContext('friendInfoId', friendInfoId);
	setContext('chats', chats);
	setContext('chatsPublic', chatsPublic);
	setContext('chatId', chatId);
	setContext('openChatWindow', openChatWindow);
	setContext('openChatForumWindow', openChatForumWindow);

	const settings = writable<Context.Settings>({
		up: 'ArrowUp',
		down: 'ArrowDown'
	});
	const soundOn = writable(true);

	setContext('settings', settings);
	setContext('soundOn', soundOn);

	async function fetchSettings() {
		const res = await fetchWithToken('settings/get-settings');
		const data = await res.json();
		$settings.up = data.up;
		$settings.down = data.down;
		return data;
	}

	setContext('fetchSettings', fetchSettings);

	const components = readable({
		Pong: Pong,
		Paint: Paint,
		Chat: Chat,
		ChatForum: ChatForum,
		FriendRequest: FriendRequest,
		Contact: Contact,
		Profile: Profile,
		Conversation: Conversation,
		Forum: Forum,
		Internet: Internet,
		Notepad: Notepad,
		EditProfile: EditProfile,
		PongKeybinds: PongKeybinds
	});

	const appInstances = writable(new Map<string, Context.AppInstance>());
	const zstack = writable<string[]>([]);
	const selected = writable<string | null>(null);

	function addInstance(
		componentType: string,
		propsWin: Record<string, any> = {},
		props: Record<string, any> = {}
	) {
		const id = uuidv4();
		$zstack = [...$zstack, id];
		$appInstances.set(id, {
			componentType: componentType as Context.App,
			component: $components[componentType as Context.App],
			visible: true,
			propsWin: { ...propsWin, appId: id },
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

	const apps = readable<Record<Context.App, Context.AppProps>>({
		Profile: {
			TabProps: { name: 'Profile', icon: '/computer.png' },
			DesktopProps: { name: 'Profile', icon: '/computer.png' }
		},
		Conversation: {
			TabProps: { name: 'Conversation', icon: '/mail3.png' },
			DesktopProps: { name: 'Conversation', icon: '/big-mail.png' }
		},
		Chat: {
			TabProps: { name: 'Chat', icon: '/mail3.png' },
			DesktopProps: { name: 'Chat', icon: '/big-mail.png' }
		},
		ChatForum: {
			TabProps: { name: 'ChatForum', icon: '/mail3.png' },
			DesktopProps: { name: 'ChatForum', icon: '/big-mail.png' }
		},
		Contact: {
			TabProps: { name: 'Contact', icon: '/phone.png' },
			DesktopProps: { name: 'Contact', icon: '/phone.png' }
		},
		Pong: {
			TabProps: { name: 'Pong', icon: '/pong.png' },
			DesktopProps: { name: 'Pong', icon: '/big-pong.png' }
		},
		FriendRequest: {
			TabProps: { name: 'FriendRequest', icon: '/computer.png' },
			DesktopProps: { name: 'FriendRequest', icon: '/computer.png' }
		},
		Forum: {
			TabProps: { name: 'Forum', icon: '/computer.png' },
			DesktopProps: { name: 'Forum', icon: '/computer.png' }
		},
		Paint: {
			TabProps: { name: 'Paint', icon: '/paint.png' },
			DesktopProps: { name: 'Paint', icon: '/paint.png' }
		},
		Internet: {
			TabProps: { name: 'Internet', icon: '/internet.png' },
			DesktopProps: { name: 'Internet', icon: '/internet.png' }
		},
		Notepad: {
			TabProps: { name: 'Notepad', icon: '/notepad.png' },
			DesktopProps: { name: 'Notepad', icon: '/notepad.png' }
		},
		EditProfile: {
			TabProps: { name: 'EditProfile', icon: '/computer.png' },
			DesktopProps: { name: 'EditProfile', icon: '/computer.png' }
		},
		PongKeybinds: {
			TabProps: { name: 'Keybinds', icon: '/computer.png' },
			DesktopProps: { name: 'Keybinds', icon: '/computer.png' }
		}
	});

	setContext('apps', apps);

	async function fetchMe() {
		const res = await fetchWithToken('users/me');
		const data = await res.json();
		$user = {
			id: data.id,
			username: data.username,
			login: data.login,
			twoFactorEnabled: data.twoFactorEnabled,
			logFrom42: data.logFrom42
		};
		return data;
	}

	async function fetchUserByUsername(username: string) {
		const res = await fetchWithToken(`users/info/name/${username}`);
		const data = await res.json();
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

	async function fetchGameRequest() {
		const res = await fetchWithToken('notification/get?type=game');
		const data = await res.json();
		$gameRequest = data;
		console.log($gameRequest);
		return data;
	}

	async function fetchHistory() {
		const res = await fetchWithToken('stat/get-history');
		const data = await res.json();
		data.forEach(function (element: any, index: number) {
			data[index] = {
				result: $user?.username === element.winnerName ? 'Win' : 'Lose',
				opponent: $user?.username === element.winnerName ? element.loserName : element.winnerName,
				createdAt: element.createdAt
			};
		});
		$history = data;
		console.log(data);
		return new Promise((resolve, reject) => {
			resolve(data);
		});
	}

	async function fetchChats() {
		const res = await fetchWithToken('chat/allUserChats');
		const data = await res.json();
		$chats = data;
		return data;
	}

	async function fetchCreateChat(
		memberUsernames: any,
		isGroupChat: any,
		accessibility: string,
		password?: string
	) {
		console.log(accessibility);
		const response = await fetchWithToken('chat/create-chat', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				memberUsernames,
				isGroupChat,
				accessibility,
				password
			})
		});

		if (!response.ok) throw new Error(`Error: ${response.statusText}`);
		const newGroupChat = await response.json();
		return newGroupChat;
	}

	async function fetchChatById(chatId: number) {
		const res = await fetchWithToken(`chat/${chatId}`);
		if (!res.ok) throw new Error(res.statusText);
		const data = await res.json();
		return data;
	}

	async function fetchPublicChats(start: number, limit: number) {
		const response = await fetchWithToken(`chat/publicChats?start=${start}&limit=${limit}`);
		const data = await response.json();
		$chatsPublic = data;
		console.log(data);
		return data;
	}

	async function fetchVerifyPassword(chatId: number, password: string) {
		const response = await fetchWithToken('chat/verifyPassword', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				chatId,
				password
			})
		});

		const data = await response.json();
		return data;
	}

	setContext('fetchPublicChats', fetchPublicChats);
	setContext('fetchGameRequest', fetchGameRequest);
	setContext('fetchHistory', fetchHistory);
	setContext('fetchMe', fetchMe);
	setContext('fetchUserByUsername', fetchUserByUsername);
	setContext('fetchFriends', fetchFriends);
	setContext('fetchFriendRequest', fetchFriendRequest);
	setContext('fetchChatById', fetchChatById);
	setContext('fetchChats', fetchChats);
	setContext('fetchCreateChat', fetchCreateChat);
	setContext('fetchVerifyPassword', fetchVerifyPassword);

	const socket = readable<Socket>(
		ioClient(PUBLIC_BACKEND_URL, {
			query: {
				token: $token
			}
		})
	);

	// ------- EVENTS --------

	$socket.on('disconnect', logout);

	$socket.on('friend', (data: { message: string }) => {
		fetchFriendRequest();
		fetchFriends();
	});

	$socket.on('game', (data: { message: string }) => {
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
			const lastReadMessageId = chatUser ? chatUser.lastReadMessageId || 0 : 0;
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
