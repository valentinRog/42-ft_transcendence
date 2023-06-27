<script lang="ts">
	import { onMount, afterUpdate } from 'svelte';
	import { Context } from '$lib/components/Context.svelte';
	import { user } from '$lib/stores';

	const socket = Context.socket();

	const chats = Context.chats();
	const blocks = Context.blocks();
	const chatId = Context.chatId();
	const friendInfoId = Context.friendInfoId();
	const contacts = Context.contacts();
	const selected = Context.selected();
	const addInstance = Context.addInstance();
	const fetchCreateChat = Context.fetchCreateChat();
	const fetchUpdateLastMessageRead = Context.fetchUpdateLastMessageRead();

	let userId = $user?.id;
	let chatIdLocal: number | null = $chatId;
	let currentChat: any = null;
	let friendUsername: string | null | undefined = '';
	let friendId: number | null = $friendInfoId;
	let messageContent = '';
	let isFriend = true;
	let chatWindow: HTMLDivElement;
	let autoScroll = true;
	let isCreatingChat = false;
	let blockedIds: number[];

	$: {
		blockedIds = $blocks.map(block => block.blockedId);
		friendUsername = $contacts.find((contact) => contact.id === friendId)?.username;
		isFriend = (friendUsername != undefined);
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
		updateLastMessageRead();
	});

	afterUpdate(() => {
		if (autoScroll) chatWindow.scrollTop = chatWindow.scrollHeight;
	});

	function openProfile(userId: number) {
		addInstance('Profile', { }, { userId: userId });
		$selected = null;
	}

	function handleScroll() {
		if (chatWindow.scrollTop + chatWindow.clientHeight + 1 >= chatWindow.scrollHeight) {
			autoScroll = true;
		} else {
			autoScroll = false;
		}
	}

	async function handleClick(event : any) {
		if (event.button === 0)
			updateLastMessageRead()
	}

	async function updateLastMessageRead() {
		const lastMessage = currentChat?.messages[currentChat?.messages.length - 1];
		if (lastMessage && lastMessage.userId !== $user?.id) {
			const chatUser = currentChat.chatUsers.find((user : any) => user.userId === userId);
			if(chatIdLocal && lastMessage.id !== chatUser.lastReadMessageId && $user?.id) {
				await fetchUpdateLastMessageRead(chatIdLocal, lastMessage.id, $user?.id);
				currentChat.chatUsers
					.find((user : any) => user.userId === userId).lastReadMessageId = lastMessage.id;
			}
		}
	}

	async function sendMessage() {
		if (messageContent.trim() === '') return;
		if (isCreatingChat) return;
		if (!chatIdLocal) {
			isCreatingChat = true;

			const memberUsernames = [$user?.username, friendUsername];
			const groupName = memberUsernames.join('-');
			const chat = await fetchCreateChat(groupName, memberUsernames, false, 'private');
			const chatExists = $chats.some((existingChat) => existingChat.id === chat.id);

			if (!chatExists) {
				$chats.push(chat);
				chatIdLocal = chat.id;
				$socket.emit('joinRoom', { chatId: chat.id });
				$socket.emit('otherAddChat', { chat: chat, userId: friendId });
			}
			isCreatingChat = false;
		}
		$socket.emit('sendMessage', {
			chatId: chatIdLocal,
			content: messageContent,
			friendId: friendId
		});
		messageContent = '';
	}

	const formatter = new Intl.DateTimeFormat('en', {
		hour12: false,
		hour: 'numeric',
		minute: '2-digit'
	});
</script>

<div id="box"  on:click={handleClick}>
	<div id="chat-window" bind:this={chatWindow} on:scroll={handleScroll}>
		{#if !currentChat}
			<h5>Waiting for messages...</h5>
		{:else}
			<h5>▪ End of messages ▪</h5>
		{/if}
		<ul>
			{#if currentChat}
				{#each currentChat?.messages || [] as message, i (i)}
					{#if !blockedIds.includes(message.userId)}
						<li class={message.user?.id === $user?.id ? 'self' : 'other'}>
							<div class="message-header">
								{#if (i > 0 && currentChat?.messages[i - 1] && currentChat?.messages[i - 1].userId != message.userId) || i === 0}
									<strong on:click={() => openProfile(message.user?.id)}>{message.user?.username}</strong>
								{/if}
							</div>
							<div class="message-content">{message.content}</div>
							<h6 class="clock">{formatter.format(new Date(message.createdAt))}</h6>
						</li>
					{/if}
				{/each}
			{/if}
		</ul>
	</div>
	<div id="sendMessage-window">
		{#if isFriend}
			<form on:submit|preventDefault={sendMessage} class="send-message-form">
				<input type="text" bind:value={messageContent} class="message-input" autocomplete="off"/>
				<button type="submit" class="btn send-btn" disabled={isCreatingChat}>Send</button>
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
		padding: 0.5rem;
		margin: 0.25rem;
		@include tab-border($light-grey, $dark-grey);
	}

	#sendMessage-window {
		padding: 0.4rem 0.2rem 0.2rem 0.2rem;
	}

	.btn {
		padding: 0.1rem 0.4rem;
	}

	.send-btn {
		@include button-95;

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
		margin-bottom: 0.25rem;
		word-break: break-word;
		display: flex;
		flex-direction: column;
	}

	li.self .message-header {
		color: white;
	}

	li.self .message-header,
	li.self .message-content {
		margin-top: 0.1rem;
		align-self: flex-end;
		display: flex;
		justify-content: flex-end;
		width: 80%;
	}

	li.other .message-header {
		color: $blue;
	}

	li.other .message-header,
	li.other .message-content {
		margin-top: 0.1rem;
		align-self: flex-start;
		display: flex;
		justify-content: flex-start;
		width: 80%;
	}

	.message-header {
		font-size: 0.85em;
		font-weight: bold;
		color: #242424d1;
	}

	.message-content {
		margin-top: 0.2rem;
		padding: 0.3rem 0.5rem;
		font-size: 0.9em;
		@include tab-border(white, black);
		background-color: $light-grey;
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
