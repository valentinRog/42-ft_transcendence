<script lang="ts">
	import { onMount } from 'svelte';
	import { chatId, friendInfo, user, chats, socket } from '$lib/stores/stores';
	import type { Socket } from 'socket.io-client';

	let chatIdLocal: number | null = $chatId;
	let friend = $friendInfo;
	let friendUsername: string | null = '';
	let socketInstance: Socket | null = null;
	let messageContent = '';
	let title = '';
	let chatWindow: HTMLDivElement;

	if (friend) {
		friendUsername = friend.username;
	}

	onMount(() => {
		socket.subscribe(($socket) => {
			socketInstance = $socket;
		});

		if (socketInstance) {
			socketInstance.on('updateChat', (chatId: number) => {
				console.log("chatId = " + chatId);
				if (chatIdLocal === null || chatIdLocal === undefined)
					chatIdLocal = chatId;
			});
		}

		let foundChat: any | null = findChat(chatIdLocal!);
		if (foundChat && foundChat.isGroupChat === true) title = foundChat.name;
		else title = friendUsername!;

		chatWindow.scrollTop = chatWindow.scrollHeight;
	});

	function findChat(chatId: number) {
		let chat: any;
		chats.subscribe(($chats) => {
			chat = $chats.find((c) => c.id === chatId);
		});
		return chat;
	}

	async function sendMessage() {
		if (messageContent.trim() === '') return;
		if (socketInstance) {
			socketInstance.emit('sendMessage', {
				chatId: chatIdLocal,
				content: messageContent,
				friendUsername: friendUsername
			});
		}
		messageContent = '';
	}

	function findUser(userId : number, chatId : number | null) {
		let chat : any;

		chats.subscribe(($chats) => {
		chat = $chats.find((c) => c.id === chatId);
		});
		if (chat) {
			let chatUser = chat.chatUsers.find((cu : any) => cu.userId === userId);
			return chatUser ? chatUser.user.username : 'Unknown';
		}
		return 'Unknown';
  	}
</script>

<div id="box">
	<div id="chat-window" bind:this={chatWindow}>
		<h4>Chat with {title}</h4>
		<ul>
			{#if $chats.find((c) => c.id === chatIdLocal)}
				{#each $chats.find((c) => c.id === chatIdLocal)?.messages || [] as message, i (i)}
					<li>
						{findUser(message.userId, chatIdLocal)}: {message.content}
					</li>
				{/each}
			{/if}
		</ul>
	</div>
	<div id="sendMessage-window">
		<form on:submit|preventDefault={sendMessage}>
			<input type="text" bind:value={messageContent} />
			<button type="submit">Send</button>
		</form>
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
