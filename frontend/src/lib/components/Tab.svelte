<script lang="ts">
	import { Context } from '$lib/components/Context.svelte';
	import { user } from '$lib/stores';

	const chatId = Context.chatId();
	const chats = Context.chats();
	const contacts = Context.contacts();
	const fetchUserById = Context.fetchUserById();

	export let name: string;
	export let icon: string;
	export let active: boolean;
	export let props: Record<string, any>;

	let currentChat: any;
	let chatIdLocal: number | null = $chatId;
	let typeChat: string | null = null;
	let friendUsername: string | undefined = '';

	let username: string | null = null;
	if (props.userId) fetchUserById(props.userId).then((data: any) => (username = data.username));

	$: {
		if (name === 'Chat' || name === 'ChatForum') {
			currentChat = $chats.find((chat) => chat.id === chatIdLocal);
			if (currentChat?.isGroupChat) typeChat = 'Group';
			else {
				typeChat = 'Chat';
				if (props.friendId)
					friendUsername = $contacts.find((c) => c.id === props.friendId)?.username;
				if (currentChat && friendUsername === undefined) {
					currentChat.chatUsers.forEach((c: any) => {
						if (c.userId !== $user?.id) friendUsername = c.user.username;
					});
				}
			}
		}
	}
</script>

<div class="tab" on:click class:active>
	<div class="border-inside">
		<img src={icon} alt={name} />
		<a href="/">
			{#if name === 'Profile' && username}
				<p>{name} of {username}</p>
			{:else if name === 'Profile'}
				<p>My {name}</p>
			{:else if name === 'ChatForum' && currentChat}
				<p>Forum: {currentChat.name}</p>
			{:else if name === 'Chat' && currentChat && currentChat.isGroupChat}
				<p>{typeChat} {currentChat.name}</p>
			{:else if name === 'Chat'}
				<p>{typeChat} {friendUsername}</p>
			{:else}
				<p>{name}</p>
			{/if}
		</a>
	</div>
</div>

<style lang="scss">
	.tab {
		@include tab;
	}
</style>
