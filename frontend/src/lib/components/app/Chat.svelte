<script lang="ts">
	import { onMount, afterUpdate } from 'svelte';
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
		{#if !currentChat}
			<h5>Waiting for messages...</h5>
		{:else}
			<h5>▪ End of messages ▪</h5>
		{/if}
		<ul>
			{#if currentChat}
				{#each currentChat?.messages || [] as message, i (i)}
					<li class={findUser(message.userId, chatIdLocal) === $user?.username ? 'self' : 'other'}>
						<div class="message-header">
							{#if (i > 0 && currentChat?.messages[i - 1] && currentChat?.messages[i - 1].userId != message.userId) || i === 0}
								<strong>{findUser(message.userId, chatIdLocal)}</strong>
							{/if}
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
		width: 20rem;
		height: 25rem;
	}

	#chat-window {
		height: 91%;
		margin-right: 0.2rem;
		overflow-y: auto;
		overflow-x: hidden;
		padding: 0 0.3rem;
	}

	#sendMessage-window {
		padding: 0.4rem 0.2rem 0.2rem 0.2rem;
	}

	.btn {
		padding: 0.1rem 0.4rem;
	}

	.send-btn {
		margin-left: auto;
		order: 2;
	}

	h5 {
		margin: 0.2rem 0 0 0;
		text-align: center;
		color: $dark-grey;
	}

	input[type='text'].message-input {
		@include tab-border(white, black);
		background-color: white;
		height: 1.5rem;
		width: 100%;
		box-sizing: border-box;
		margin-right: 0.5rem;
		order: 1;
		outline: none;
	}

	ul {
		list-style: none;
		display: flex;
		flex-direction: column;
	}

	li {
		margin-top: 0.1rem;
		word-break: break-word;
		display: flex;
		flex-direction: column;
	}

	li.self .message-header {
		color: white;
	}

	li.self .message-header,
	li.self .message-content {
		align-self: flex-end;
		display: flex;
		justify-content: flex-end;
		width: 75%;
	}

	li.other .message-header {
		color: $blue;
	}

	li.other .message-header,
	li.other .message-content {
		align-self: flex-start;
		display: flex;
		justify-content: flex-start;
		width: 75%;
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
		@include tab-border(white, black);
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
