<script lang="ts">
	import { onMount } from 'svelte';
	import { token, chatRecipient, messagesStore, user, chats } from '$lib/stores/stores';
	import io, { Socket } from 'socket.io-client';
	import { get } from 'svelte/store';

	let friend = $chatRecipient;
	let friendUsername = '';
	let friendId = 0;
	let socket: Socket | null = null;
	let messageContent = '';
	let chat: number | null = null;

	if (friend) {
    	friendUsername = friend.username;
		friendId = friend.id;
	}

	onMount(() => {
		socket = io('http://localhost:3000', {
			query: { token: $token }
		});
		chat = findChat($user?.username || "defaultUserName", friendUsername);
		console.log(chat);
		socket.on('message', (message) => {
			if (message.from === friendUsername) {
				messagesStore.update(currentMessages => {
					if (!currentMessages[message.from]) {
						currentMessages[message.from] = [];
					}
					currentMessages[message.from].push(message.from + ': ' + message.content);
					return currentMessages;
				});
			}
		});
	});

	function findChat(user1: string, user2: string) {
		let foundChat = null;

		chats.subscribe(($chats) => {
        $chats.forEach(chat => {
            const users = chat.chatUsers.map(chatUser => chatUser.user.username);
            if (users.includes(user1) && users.includes(user2)) {
                foundChat = chat;
            }
        	});
		});
    	return foundChat;
	}

	async function sendApiMessage(recipientUsername: string, content: string) {
		const response = await fetch('http://localhost:3000/chat/add-message', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${$token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ recipientUsername, content })
		});
		if (!response.ok) {
			console.error(`Error sending message: ${response.statusText}`);
    }
}

	function sendMessage() {
		if (messageContent.trim() === '') return;
		if (socket) {
			socket.emit('sendMessage', { to: friendUsername, content: messageContent });
			sendApiMessage(friendUsername, messageContent);
			messagesStore.update(currentMessages => {
				currentMessages = { ...currentMessages };
				if (!currentMessages[friendUsername]) {
					currentMessages[friendUsername] = [];
				}
				currentMessages[friendUsername].push('You: ' + messageContent);
				return currentMessages;
			});
			messageContent = '';
		}
		console.log($messagesStore);
	}
</script>

<div id="box">
	<div id="chat-window">
		<h4>Chat with {friendUsername}</h4>
		<ul>
			{#if $messagesStore[friendUsername]}
				{#each $messagesStore[friendUsername] as message, i (i)}
					<li>{message}</li>
				{/each}
			{/if}
		</ul>
	</div>
	<div id="sendMessage-window">
		<input bind:value={messageContent} placeholder="Write a message..." />
		<button on:click={sendMessage}>Send Message</button>
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
