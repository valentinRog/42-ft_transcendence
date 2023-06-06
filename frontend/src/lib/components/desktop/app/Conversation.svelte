<script lang="ts">
	import { user } from '$lib/stores/stores';
	import { Context } from '$lib/components/desktop/Context.svelte';

	const chats = Context.chats();
	const chatId = Context.chatId();
	const openChatWindow = Context.openChatWindow();

	function startChat(chatNumber: number) {
		$chatId = chatNumber;
		$openChatWindow = true;
	}

	function getLastMessageSender(chat: any) {
		if (chat.messages.length > 0) {
			return chat.chatUsers.find(
				(chatUser: any) => chatUser.userId === chat.messages[chat.messages.length - 1].userId
			)?.user?.username;
		} else {
			return 'No messages yet';
		}
	}
</script>

<div id="box">
	<div id="chat-window">
		{#each $chats.sort((chatA, chatB) => {
			const dateA = new Date(chatA.messages.length > 0 ? chatA.messages[chatA.messages.length - 1].createdAt : chatA.createdAt);
			const dateB = new Date(chatB.messages.length > 0 ? chatB.messages[chatB.messages.length - 1].createdAt : chatB.createdAt);
			return dateB.getTime() - dateA.getTime(); // This will sort in descending order
		}) as chat (chat.id)}
			<div class="chat" on:click={() => startChat(chat.id)}>
				<h4>
					{chat.isGroupChat
						? 'Group: ' + chat.name
						: 'Chat: ' +
						  chat.chatUsers.find((chatUser) => chatUser.userId !== $user?.id)?.user?.username}
				</h4>
				{#if chat.messages.length > 0}
					<p>{getLastMessageSender(chat)}: {chat.messages[chat.messages.length - 1].content}</p>
				{:else}
					<p>No messages yet</p>
				{/if}
			</div>
		{/each}
	</div>
</div>

<style lang="scss">
	@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

	body {
		font-family: 'Press Start 2P', cursive;
		background: #008080;
		color: black;
	}

	#box {
		width: 15rem;
		background: #c0c0c0;
		border-right-color: #fff;
		border-bottom-color: #fff;
	}

	#chat-window {
		height: 40vh;
		overflow-y: auto;
		border-right-color: #fff;
		border-bottom-color: #fff;
		margin-bottom: 1rem;
		padding: 1rem;
	}

	.chat {
		border: 2px solid #000;
		border-right-color: #fff;
		border-bottom-color: #fff;
		padding: 1rem;
		margin-bottom: 1rem;
	}

	h4 {
		color: #000080;
	}

	p {
		color: #000;
	}
</style>
