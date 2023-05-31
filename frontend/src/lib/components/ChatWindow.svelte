<script lang="ts">
	import { onMount } from 'svelte';
	import { token, chatId, friendInfo, user, chats } from '$lib/stores/stores';
	import io, { Socket } from 'socket.io-client';

	let chatIdLocal: number | null = $chatId;
	let friend = $friendInfo;
	let friendUsername = '';
	let socket: Socket | null = null;
	let messageContent = '';
	let foundChat: any = null;

	if (friend) {
		friendUsername = friend.username;
	}

	onMount(() => {
		socket = io('http://localhost:3000', {
			query: { token: $token }
		});

		if (chatIdLocal) foundChat = findChat(chatIdLocal);

		console.log(foundChat);
		socket.on('message', (message) => {
			if (message.from === friendUsername) {
				chats.update((currentChats) => {
					let targetChat = currentChats.find((chat) => chat.id === foundChat?.id);
					if (targetChat) {
						if (!targetChat.messages) targetChat.messages = [];
						const newMessage = { userid: $user?.id, content: message.content };
						targetChat.messages.push(newMessage);
					}
					return currentChats;
				});
			}
		});
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
			socket.emit('sendMessage', { to: friendUsername, content: messageContent });
			sendApiMessage(friendUsername, chatIdLocal, messageContent);
			chats.update((currentChats) => {
				currentChats = currentChats.map((chat) => {
					if (chat.id === foundChat?.id) {
						const newMessage = { userid: $user?.id, content: messageContent };
						chat.messages.push(newMessage);
					}
					return chat;
				});
				return currentChats;
			});
			messageContent = '';
		}
	}

	async function sendApiMessage(recipientUsername: string, chatId: number | null, content: string) {
		const response = await fetch('http://localhost:3000/chat/add-message', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${$token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ recipientUsername, chatId, content })
		});
		if (!response.ok) console.error(`Error sending message: ${response.statusText}`);
	}
</script>

<div id="box">
	<div id="chat-window">
		<h4>Chat with {friendUsername}</h4>
		<ul>
			{#if foundChat && $chats.find((c) => c.id === foundChat.id)}
				{#each $chats.find((c) => c.id === foundChat.id)?.messages || [] as message, i (i)}
					<li>
						{message.userId === $user?.id ? $user.username : friendUsername}: {message.content}
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
