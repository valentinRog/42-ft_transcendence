<script lang="ts">
	import { onMount } from 'svelte';
	import { token, chatRecipient } from '$lib/stores/stores';
	import io, { Socket } from 'socket.io-client';

	let friendUsername = $chatRecipient;

	let socket: Socket | null = null;
	let messages: string[] = [];
	let messageContent = '';

	onMount(() => {
		socket = io('http://38.242.214.243:3000', {
			query: { token: $token }
		});

		socket.on('message', (message) => {
			if (message.from === friendUsername) {
				messages.push(message.from + ': ' + message.content);
				messages = messages;
			}
		});
	});

	function sendMessage() {
		if (messageContent.trim() === '') return;
		if (socket) {
			console.log(`Sending message to ${friendUsername}: ${messageContent}`);
			socket.emit('sendMessage', { to: friendUsername, content: messageContent });
			messages.push('You: ' + messageContent);
			messages = messages;
			messageContent = '';
		}
	}
</script>

<div id="box">
	<div id="chat-window">
		<h4>Chat with {friendUsername}</h4>
		<ul>
			{#each messages as message (message)}
				<li>{message}</li>
			{/each}
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
