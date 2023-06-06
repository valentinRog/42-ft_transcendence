<script lang="ts" context="module">
	import type { Readable, Writable } from 'svelte/store';
	import { getContext } from 'svelte';

	export namespace Context {
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
			readonly id: number;
			readonly propsWin: Record<string, any>;
			readonly props: Record<string, any>;
		}

		export const components = (): Writable<Record<App, any>> => getContext('components');

		export const appInstances = (): Writable<AppInstance[]> => getContext('appInstances');
		export const selected = (): Writable<number | null> => getContext('selected');
		export const zstack = (): Writable<number[]> => getContext('zstack');
		export const gid = (): Writable<number> => getContext('gid');

		export const addInstance = (): Readable<
			(componentType: string, propsWin?: Record<string, any>, props?: Record<string, any>) => void
		> => getContext('addInstance');

		export const time = (): Writable<Date> => getContext('time');
	}
</script>

<script lang="ts">
	import { writable, readable } from 'svelte/store';
	import { setContext } from 'svelte';
	import Pong from '$lib/components/desktop/app/Pong.svelte';
	import Chat from '$lib/components/desktop/app/Chat.svelte';
	import Contact from '$lib/components/desktop/app/Contact.svelte';
	import Profile from '$lib/components/desktop/app/Profile.svelte';
	import Conversation from '$lib/components/desktop/app/Conversation.svelte';
	import FriendRequest from '$lib/components/desktop/app/FriendRequest.svelte';

	setContext('contacts', writable<Context.Contact[]>([]));
	setContext('friendRequest', writable<Context.Contact[]>([]));
	setContext('openFriendRequest', writable(false));
	setContext('friendInfo', writable<Context.User | null>(null));
	setContext('chats', writable<Context.Chat[]>([]));
	setContext('chatId', writable<number | null>(null));
	setContext('openChatWindow', writable(false));

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
	const gid = writable(0);
	const selected = writable<number | null>(null);

	const addInstance = readable(
		(
			componentType: string,
			propsWin: Record<string, any> = {},
			props: Record<string, any> = {}
		) => {
			$zstack = [...$zstack, $zstack.length];
			$appInstances = [
				...$appInstances,
				{
					componentType: componentType as Context.App,
					component: $components[componentType as Context.App],
					visible: true,
					id: $gid++,
					propsWin,
					props
				}
			];
		}
	);

	setContext('components', components);
	setContext('appInstances', appInstances);
	setContext('zstack', zstack);
	setContext('gid', gid);
	setContext('selected', selected);
	setContext('addInstance', addInstance);

	setContext(
		'time',
		readable(new Date(), function start(set) {
			const interval = setInterval(() => {
				set(new Date());
			}, 1000);

			return function stop() {
				clearInterval(interval);
			};
		})
	);
</script>

<slot />
