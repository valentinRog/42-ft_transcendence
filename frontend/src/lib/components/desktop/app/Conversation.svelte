<script lang="ts">
	import { chats, user, chatId, openChatWindow } from '$lib/stores/stores';
	import { onMount } from 'svelte';

	onMount(() => {
		console.log($chats);
	});

	function startChat(chatNumber: number) {
		$chatId = chatNumber;
		$openChatWindow = true;
    }

	function getLastMessageSender(chat : any) {
		if (chat.messages.length > 0) {
			return chat.chatUsers.find((chatUser : any) => 
				chatUser.userId === chat.messages[chat.messages.length - 1].userId)?.user?.username;
		} else {
			return "No messages yet";
		}
	}
</script>

<div id="box">
	<div id="chat-window">
		{#each $chats as chat (chat.id)}
			<div class="chat" on:click={() => startChat(chat.id)}>
				<h4>{chat.isGroupChat ? "Group: " + chat.name : 
					"Chat: " + chat.chatUsers.find(chatUser => chatUser.userId !== $user?.id)?.user?.username}</h4>
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