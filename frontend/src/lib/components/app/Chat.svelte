<script lang="ts">
	import { onMount, afterUpdate } from 'svelte';
	import type { Socket } from 'socket.io-client';
	import { Context } from '$lib/components/Context.svelte';
	import { user } from '$lib/stores';

	const socket = Context.socket();

	const chats = Context.chats();
	const chatId = Context.chatId();
	const friendInfoId = Context.friendInfoId();
	const contacts = Context.contacts();

	let chatIdLocal: number | null = $chatId;
	let currentChat: any = null;
	let friendUsername: string | null | undefined = '';
	let friendId: number | null = $friendInfoId;
	let messageContent = '';
	let isFriend = true;
	let chatWindow: HTMLDivElement;
	let autoScroll = true;

	$: {
		friendUsername = $contacts.find((contact) => contact.id === friendId)?.username;
		if (friendUsername === undefined) isFriend = false;
		else isFriend = true;
		if (chatIdLocal !== null && chatIdLocal !== undefined) {
			currentChat = $chats.find((chat) => chat.id === chatIdLocal);
			if (currentChat.isGroupChat) isFriend = true;
		}
	}

	onMount(() => {
		$socket.on('updateChat', (chatId: number) => {
			if (chatIdLocal === null || chatIdLocal === undefined) chatIdLocal = chatId;
		});
		chatWindow.scrollTop = chatWindow.scrollHeight;
	});

	afterUpdate(() => {
		if (autoScroll) chatWindow.scrollTop = chatWindow.scrollHeight;
	});

	function handleScroll() {
		if (chatWindow.scrollTop + chatWindow.clientHeight + 1 >= chatWindow.scrollHeight) {
			autoScroll = true;
		} else {
			autoScroll = false;
		}
	}

	async function sendMessage() {
		if (messageContent.trim() === '') return;
		$socket.emit('sendMessage', {
			chatId: chatIdLocal,
			content: messageContent,
			friendUsername: friendUsername
		});
		messageContent = '';
	}

	function findUser(userId: number, chatId: number | null) {
		if (currentChat) {
			let chatUser = currentChat.chatUsers.find((cu: any) => cu.userId === userId);
			return chatUser ? chatUser.user.username : 'Unknown';
		}
		return 'Unknown';
	}

	async function leaveGroup() {
		$socket.emit('leaveGroup', { chatId: chatIdLocal });
	}
</script>

<div id="box">
	<div id="chat-window" bind:this={chatWindow} on:scroll={handleScroll}>
		<h5>Waiting message...</h5>
		<ul>
			{#if currentChat}
				{#each currentChat?.messages || [] as message, i (i)}
					<li class={findUser(message.userId, chatIdLocal) === $user?.username ? 'self' : 'other'}>
						<div class="message-header">
							<strong>{findUser(message.userId, chatIdLocal)}</strong><span>:</span>
						</div>
						<div class="message-content">{message.content}</div>
					</li>
				{/each}
			{/if}
		</ul>
	</div>
	<div id="sendMessage-window">
		{#if isFriend}
			<form on:submit|preventDefault={sendMessage} class="send-message-form">
				<input type="text" bind:value={messageContent} class="message-input" />
				<button type="submit" class="btn send-btn">Send</button>
			</form>
		{:else}
			<p>You are no longer friends with this user.</p>
		{/if}
	</div>
</div>

<style lang="scss">
	#box {
		background: #c0c0c0;
		color: #000;
		font-family: 'MS Sans Serif', sans-serif;
		box-shadow: 1px 1px 5px 1px rgba(0, 0, 0, 0.5);
		width: 15rem;
		height: 17rem;
	}

	#chat-window {
		height: 85%;
		overflow-y: auto;
		overflow-x: hidden;
		padding: 0.5rem;
		border-bottom: 1px solid #000;
	}

	#sendMessage-window {
		padding: 0.5rem;
	}

	.btn {
		background: #c0c0c0;
		border: 1px solid #000;
		color: #000;
	}

	.send-btn {
		margin-left: auto;
		order: 2;
	}

	.leave-group {
		float: right;
	}

	h5 {
		margin: 0;
		text-align: center;
		color: rgba(51, 51, 51, 0.814);
	}

	input[type='text'].message-input {
		width: 100%;
		box-sizing: border-box;
		margin-right: 0.5rem;
		order: 1;
	}

	ul {
		list-style: none;
		padding: 0;
		display: flex;
		flex-direction: column;
	}

	li {
		margin-bottom: 0.5rem;
		word-break: break-word;
		display: flex;
		flex-direction: column;
	}

	li.self .message-header,
	li.self .message-content {
		align-self: flex-end;
		display: flex;
		justify-content: flex-end;
		width: 9.5rem;
	}

	li.other .message-header,
	li.other .message-content {
		align-self: flex-start;
		display: flex;
		justify-content: flex-start;
		width: 9.5rem;
	}

	.message-header {
		font-size: 0.85em;
		font-weight: bold;
		color: #242424d1;
	}

	.message-content {
		margin-top: 0.2rem;
		padding-left: 0.5rem;
		padding-right: 0.5rem;
		padding-top: 0.3rem;
		padding-bottom: 0.3rem;
		font-size: 0.9em;
		border-radius: 0.8rem;
		background-color: rgb(229, 229, 229);
	}

	.send-message-form {
		display: flex;
		width: 100%;
	}

	p {
		font-weight: bold;
		text-align: center;
		font-size: 0.9rem;
	}
</style>
