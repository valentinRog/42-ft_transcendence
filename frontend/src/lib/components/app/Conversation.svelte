<script lang="ts">
	import { onDestroy } from 'svelte';
	import { user } from '$lib/stores';
	import { Context } from '$lib/components/Context.svelte';
	import NotificationBadge from '$lib/components/NotificationBadge.svelte';

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
			return chat.messages[chat.messages.length - 1].user?.username;
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
											{chatUser.user.username + (chat.chatUsers.length - 1 - i > 1 ? ', ' : '')}
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
								<p>
									{chat.messages[chat.messages.length - 1].userId === $user?.id
										? 'you'
										: getLastMessageSender(chat)}
									: {chat.messages[chat.messages.length - 1].content}
								</p>
								<span class="timestamp"
									>{timeDifference(
										now,
										new Date(chat.messages[chat.messages.length - 1].createdAt)
									)}</span
								>
							</div>
							<p class="notification-badge">
								<NotificationBadge count={getUnreadMessagesCount(
									chat,
									chat.chatUsers.find((chatUser) => chatUser.userId === $user?.id)
								)} />
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
	#box {
		width: 20rem;
	}

	#chat-window {
		height: 22rem;
		overflow-y: auto;
		overflow-x: hidden;
		margin: 0.2rem;
		padding: 0.3rem;
	}

	.chat {
		@include tab-border($light-grey, $dark-grey);
		padding: 0.5rem;
		margin-bottom: 0.2rem;
	}

	h4 {
		color: $blue;
		margin-bottom: 0.2rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 12rem;
		h5 {
			overflow: hidden;
			text-overflow: ellipsis;
			max-width: 15rem;
		}
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
		margin-bottom: 0.2rem;
	}

	.chat-content {
		position: relative;
		display: flex;
		justify-content: space-between;
	}

	.notification-badge {
		margin-top: 1rem;
	}

	.timestamp {
		font-size: 0.8rem;
		color: $dark-grey;
	}
</style>
