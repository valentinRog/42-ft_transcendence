<script lang="ts">
	import { onMount } from 'svelte';
	import type { Socket } from 'socket.io-client';
	import { Context } from '$lib/components/Context.svelte';
	import { user } from '$lib/stores';

	const socket = Context.socket();

	const chats = Context.chats();
	const chatId = Context.chatId();
	const friendInfo = Context.friendInfo();

	let chatIdLocal: number | null = $chatId;
	let friend = $friendInfo;
	let friendUsername: string | null = '';
	let socketInstance: Socket | null = null;
	let messageContent = '';
	let chatWindow: HTMLDivElement;

	if (friend) {
		friendUsername = friend.username;
	}

	onMount(() => {
		socket.subscribe(($socket) => {
			socketInstance = $socket;
		});

		if (socketInstance) {
			socketInstance.on('updateChat', (chatId: number) => {
				if (chatIdLocal === null || chatIdLocal === undefined) chatIdLocal = chatId;
			});
		}
		chatWindow.scrollTop = chatWindow.scrollHeight;
	});

	function findChat(chatId: number) {
		let chat: any;
		chats.subscribe(($chats) => {
			chat = $chats.find((c) => c.id === chatId);
		});
		return chat;
	}

	async function sendMessage() {
		if (messageContent.trim() === '') return;
		if (socketInstance) {
			socketInstance.emit('sendMessage', {
				chatId: chatIdLocal,
				content: messageContent,
				friendUsername: friendUsername
			});
		}
		messageContent = '';
	}

	function findUser(userId: number, chatId: number | null) {
		let chat: any;

		chats.subscribe(($chats) => {
			chat = $chats.find((c) => c.id === chatId);
		});
		if (chat) {
			let chatUser = chat.chatUsers.find((cu: any) => cu.userId === userId);
			return chatUser ? chatUser.user.username : 'Unknown';
		}
		return 'Unknown';
	}

	async function leaveGroup() {
		if (socketInstance) socketInstance.emit('leaveGroup', { chatId: chatIdLocal });
	}
</script>

<div id="box">
    <div id="chat-window" bind:this={chatWindow}>
        <h5>Waiting message...</h5>
        <ul>
            {#if $chats.find((c) => c.id === chatIdLocal)}
                {#each $chats.find((c) => c.id === chatIdLocal)?.messages || [] as message, i (i)}
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
        <form on:submit|preventDefault={sendMessage} class="send-message-form">
            <input type="text" bind:value={messageContent} class="message-input" />
            <button type="submit" class="btn send-btn">Send</button>
        </form>
    </div>
</div>

<style lang="scss">
    #box {
        background: #C0C0C0;
        color: #000;
        font-family: 'MS Sans Serif', sans-serif;
        box-shadow: 1px 1px 5px 1px rgba(0, 0, 0, 0.5);
        border: 1px outset white;
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
        background: #C0C0C0;
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
    }

    input[type="text"].message-input {
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

    li.self .message-header, li.self .message-content {
        align-self: flex-end;
        display: flex;
        justify-content: flex-end;
        width: 9.5rem;
    }

    li.other .message-header, li.other .message-content {
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
        padding-left: 0.5rem;
		padding-right: 0.5rem;
		padding-top: 0.3rem;
		padding-bottom: 0.3rem;
		font-size: 0.9em;
		border: 0.12em solid #4f4f4fad;
		border-radius: 0.8rem;
    }

    .send-message-form {
        display: flex;
        width: 100%;
    }
</style>

