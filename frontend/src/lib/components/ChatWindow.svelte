<script lang="ts">
	import { onMount } from 'svelte';
	import { token, friendInfo, user, chats } from '$lib/stores/stores';
	import io, { Socket } from 'socket.io-client';

	let friend = $friendInfo;
	let friendUsername = '';
	let friendId = 0;
	let socket: Socket | null = null;
	let messageContent = '';
	let chat: number | null = null;
	let foundChat: any = null;

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
        		chats.update(currentChats => {
            	let targetChat = currentChats.find(chat => chat.id === foundChat?.id);
            	if (targetChat) {
                	if (!targetChat.messages)
                    	targetChat.messages = [];
                const newMessage = { userid: $user?.id, content: message.content };
                targetChat.messages.push(newMessage);
            	}
            	return currentChats;
        		});
    		}
		});
	});

	function findChat(user1: string, user2: string) {
		chats.subscribe(($chats) => {
        $chats.forEach(chat => {
            const users = chat.chatUsers.map(chatUser => chatUser.user.username);
            if (users.includes(user1) && users.includes(user2) && chat.isGroupChat === false) {
                foundChat = chat;
            }
        	});
		});
    	return foundChat;
	}

	function sendMessage() {
		if (messageContent.trim() === '') return;
		if (socket) {
			socket.emit('sendMessage', { to: friendUsername, content: messageContent });
			sendApiMessage(friendUsername, messageContent);
			chats.update(currentChats => {
			currentChats = currentChats.map(chat => {
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

	async function sendApiMessage(recipientUsername: string, content: string) {
		const response = await fetch('http://localhost:3000/chat/add-message', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${$token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ recipientUsername, content })
		});
		if (!response.ok)
			console.error(`Error sending message: ${response.statusText}`);
	}
</script>

<div id="box">
	<div id="chat-window">
		<h4>Chat with {friendUsername}</h4>
		<ul>
		  {#if foundChat && $chats.find(c => c.id === foundChat.id)}
			{#each $chats.find(c => c.id === foundChat.id)?.messages || [] as message, i (i)}
			  <li>
				{message.userId === $user?.id ? $user.username : friendUsername}: {message.content}
			  </li>
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
