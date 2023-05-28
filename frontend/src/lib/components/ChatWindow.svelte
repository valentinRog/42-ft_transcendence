<script lang="ts">
	import { onMount } from 'svelte';
	import { token, chatRecipient, messagesStore } from '$lib/stores/stores';
	import io, { Socket } from 'socket.io-client';
	import { get } from 'svelte/store';

	let friendUsername = $chatRecipient;

	let socket: Socket | null = null;
	let messageStore = get(messagesStore);
	let messageContent = '';

	onMount(() => {
		socket = io('http://localhost:3000', {
			query: { token: $token }
		});

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

	async function sendApiMessage(recipientUsername: string, content: string) {
		const response = await fetch('http://localhost:3000/chat/add-message', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${$token}`
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
				if (!currentMessages[friendUsername]) {
					currentMessages[friendUsername] = [];
				}
				currentMessages[friendUsername].push('You: ' + messageContent);
				return currentMessages;
			});
			messageContent = '';
		}
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
