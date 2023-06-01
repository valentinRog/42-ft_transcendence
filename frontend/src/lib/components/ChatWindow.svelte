<script lang="ts">
	import { onMount } from 'svelte';
	import { token, chatId, friendInfo, user, chats } from '$lib/stores/stores';
	import io, { Socket } from 'socket.io-client';

	let chatIdLocal: number | null = $chatId;
	let friend = $friendInfo;
	let friendUsername: string | null = '';
	let socket: Socket | null = null;
	let messageContent = '';
	let foundChat: any = null;
	let title = '';

	if (friend) {
		friendUsername = friend.username;
	}

	onMount(() => {
		socket = io('http://localhost:3000', {
			query: { token: $token }
		});
		foundChat = findChat(chatIdLocal!);
		if (foundChat)
			title = foundChat.chatname;
		else
			title = friendUsername!;
	});

	function findChat(chatId: number) {
		let chat: any;
		chats.subscribe(($chats) => {
			chat = $chats.find((c) => c.id === chatId);
		});
		return chat;
	}

	function sendMessage() {
		if (messageContent.trim() === '') return;
		if (socket) {
			socket.emit('sendMessage', {chatId: chatIdLocal, content: messageContent, friendUsername: friendUsername} );
		}
	}

</script>

<div id="box">
	<div id="chat-window">
		<h4>Chat with {title}</h4>
		<ul>
			{#if foundChat && $chats.find((c) => c.id === foundChat.id)}
				{#each $chats.find((c) => c.id === foundChat.id)?.messages || [] as message, i (i)}
					<li>
						{"quelqu'un"}: {message.content}
					</li>
				{/each}
			{/if}
		</ul>
	</div>
	<div id="sendMessage-window">
		<input type="text" bind:value={messageContent} />
		<button on:click={sendMessage}>Send</button>
	</div>
</div>

<style lang="scss">
	#box {
		width: 15rem;
		height: 15rem;

		button {
			margin-left: 0.25rem;
		}
	}

	#chat-window {
		height: 13rem;
		overflow-y: auto;
	}
</style>
