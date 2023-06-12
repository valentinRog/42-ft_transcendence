<script lang="ts">
	import { onDestroy } from 'svelte';
	import { user } from '$lib/stores';
	import { Context } from '$lib/components/Context.svelte';
	import { each } from 'svelte/internal';

	const chats = Context.chats();
	const chatId = Context.chatId();
	const friendInfoId = Context.friendInfoId();
	const openChatWindow = Context.openChatWindow();
	const getUnreadMessagesCount = Context.getUnreadMessagesCount();
	let now = new Date();

	const intervalId = setInterval(() => {
		now = new Date();
	}, 30000);

	onDestroy(() => {
		clearInterval(intervalId);
	});

	function startChat(chatNumber: number, chat: any) {
		$chatId = chatNumber;
		$friendInfoId = chat.chatUsers.find((c: any) => c.userId !== $user?.id)?.user?.id;
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

	function timeDifference(current: Date, previous: Date) {
		const msPerMinute = 60 * 1000;
		const msPerHour = msPerMinute * 60;
		const msPerDay = msPerHour * 24;
		const msPerMonth = msPerDay * 30;
		const msPerYear = msPerDay * 365;

		const elapsed = current.getTime() - previous.getTime();
		if (elapsed <= 0) return 'just now';
		else if (elapsed < msPerMinute) return Math.round(elapsed / 1000) + ' s ago';
		else if (elapsed < msPerHour) return Math.round(elapsed / msPerMinute) + ' min ago';
		else if (elapsed < msPerDay) return Math.round(elapsed / msPerHour) + ' h ago';
		else if (elapsed < msPerMonth) return Math.round(elapsed / msPerDay) + ' d ago';
		else if (elapsed < msPerYear) return Math.round(elapsed / msPerMonth) + ' m ago';
		else return Math.round(elapsed / msPerYear) + ' y ago';
	}
</script>

<div id="box">
	<div id="chat-window">
		{#each $chats.sort((chatA, chatB) => {
			const dateA = new Date(chatA.messages.length > 0 ? chatA.messages[chatA.messages.length - 1].createdAt : chatA.createdAt);
			const dateB = new Date(chatB.messages.length > 0 ? chatB.messages[chatB.messages.length - 1].createdAt : chatB.createdAt);
			return dateB.getTime() - dateA.getTime();
		}) as chat (chat.id)}
			{#if chat.accessibility === 'private'}
				<div class="chat" on:click={() => startChat(chat.id, chat)}>
					<div class="chat-header">
						{#if chat.isGroupChat}
							<h4>
								{chat.name}
								<h5>
									{#each chat.chatUsers as chatUser, i}
										{#if chatUser.user.username != $user?.username}
											{chatUser.user.username + (chat.chatUsers.length - i > 1 ? ', ' : '')}
										{/if}
									{/each}
								</h5>
							</h4>
						{:else}
							<h4>
								{chat.chatUsers.find((chatUser) => chatUser.userId !== $user?.id)?.user?.username}
							</h4>
						{/if}
					</div>
					<div class="chat-content">
						{#if chat.messages.length > 0}
							<div class="message-details">
								<p>{getLastMessageSender(chat)}: {chat.messages[chat.messages.length - 1].content}</p>
								<span class="timestamp"
									>{timeDifference(
										now,
										new Date(chat.messages[chat.messages.length - 1].createdAt)
									)}</span
								>
							</div>
							<p class="unread-messages">
								{getUnreadMessagesCount(
									chat,
									chat.chatUsers.find((chatUser) => chatUser.userId === $user?.id)
								)}
							</p>
						{:else}
							<p>No messages yet</p>
						{/if}
					</div>
				</div>
			{/if}
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
		height: 22rem;
		overflow-y: auto;
		overflow-x: hidden;
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
		margin-bottom: 0.5rem;

		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 9.5rem;
	}

	p {
		color: #000;
	}

	.chat-content {
		position: relative;
		display: flex;
		justify-content: space-between;
	}

	.message-details p {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 8.6rem;
	}

	.chat-content {
		position: relative;
		display: flex;
		justify-content: space-between;
	}

	.unread-messages {
		position: absolute;
		right: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 1.5em;
		height: 1.5em;
		color: white;
		background-color: rgb(213, 1, 1);
		border-radius: 50%;
		font-size: 0.6em;
		margin: 0;
		align-self: center;
	}

	.timestamp {
		font-size: 0.8rem;
		color: rgb(58, 58, 58);
	}
</style>
