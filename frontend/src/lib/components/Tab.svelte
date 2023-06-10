<script lang="ts">
	import { Context } from '$lib/components/Context.svelte';

	const chatId = Context.chatId();
	const chats = Context.chats();
	const contacts = Context.contacts();

	export let name: string;
	export let icon: string;
	export let active: boolean;
	export let props: Record<string, any>;

	let currentChat: any;
	let chatIdLocal: number | null = $chatId;
	let typeChat: string | null = null;
	let friendUsername: string | undefined = '';

	$: {
		if (name === 'Chat') {
			currentChat = $chats.find((chat) => chat.id === chatIdLocal);
			if (currentChat?.isGroupChat) typeChat = 'Group';
			else { 
				typeChat = 'Chat';
				if (props.friendId) friendUsername = $contacts.find((c) => c.id === props.friendId)?.username;
			}
		}
	}

</script>

<div class="tab" on:click class:active>
	<div class="border-inside">
		<img src={icon} alt={name} />
		<a href="/">
			{#if name === 'Profile' && props.username}
				<p>{name} of {props.username}</p>
			{:else if name === 'Profile'}
				<p>My {name}</p>
			{:else if name === 'Chat' && currentChat && currentChat.isGroupChat}
				<p>{typeChat}: {currentChat.name}</p>
			{:else if name === 'Chat'}
				<p>{typeChat} : {friendUsername}</p>
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
