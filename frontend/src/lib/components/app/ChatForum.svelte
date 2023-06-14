<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { Context } from '$lib/components/Context.svelte';
    import { user } from '$lib/stores';

    const socket = Context.socket();
    const chats = Context.chats();
    const chatId = Context.chatId();

    let currentChat: any = null;
    let selectedUser: any = null;
    let chatIdLocal: number | null = $chatId;
    let messageContent = '';
    let roleId: number;
	let isUserBanned = false;
	let disabled = false;
	let banExpiresAt: Date | null = null;

    $: {
    	currentChat = $chats.find((chat) => chat.id === chatIdLocal);
        roleId = currentChat?.chatUsers.find((cu: any) => cu.userId === $user?.id)?.roleId;

		if (currentChat && currentChat.bans) {
			const ban = currentChat.bans.find((ban: any) => ban.userId === $user?.id 
				&& (ban.expiresAt == null || new Date(ban.expiresAt) > new Date()));
			isUserBanned = !!ban;
			if (isUserBanned) chatIdLocal = null;
		}

		disabled = isUserBanned;
    }
	
	onMount(() => {
		if (currentChat && currentChat.bans) {
			const ban = currentChat.bans.find((ban: any) => ban.userId === $user?.id 
				&& (ban.expiresAt == null || new Date(ban.expiresAt) > new Date()));
			isUserBanned = !!ban;
			if (isUserBanned) {
				banExpiresAt = ban.expiresAt ? new Date(ban.expiresAt) : null;
				chatIdLocal = null;
			}
		} else
		$socket.emit('joinRoom', { chatId: chatIdLocal });
	});

	onDestroy(() => {
		$socket.emit('leaveRoom', { chatId: chatIdLocal });
	});

    async function sendMessage() {
		if (messageContent.trim() === '') return;
            $socket.emit('sendMessage', {
                chatId: chatIdLocal,
                content: messageContent,
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

    function selectUser(user: any) {
        selectedUser = user;
    }

	function banUser(userId: number, duration: number | null) {
		$socket.emit('banUser', { chatId: chatIdLocal, userId, duration });
	}

	function unbanUser(userId: number) {
		$socket.emit('unbanUser', { chatId: chatIdLocal, userId });
	}

	$socket.on('userBan', (data: any) => {
		if (data.chatId === chatIdLocal) {
			isUserBanned = true;
			banExpiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
			chatIdLocal = null;
		}
	});	
</script>

<div id="box">
	<div id="chat-window">
		{#if isUserBanned && chatIdLocal === null}
		<p>You are banned from this Topics {banExpiresAt ? `until ${banExpiresAt.toLocaleString()}` : 'indefinitely'}.</p>
		{:else}
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
		{/if}
	</div>
	<div id="sendMessage-window">
		<form on:submit|preventDefault={sendMessage} class="send-message-form">
			<input type="text" bind:value={messageContent} class="message-input" disabled={disabled} />
			<button type="submit" class="btn send-btn" disabled={disabled}>Send</button>
		</form>
	</div>
    <div id="user-list">
        {#if currentChat}
            <h5>Users in this chat:</h5>
            <ul>
                {#each currentChat.chatUsers as chatUser (chatUser.userId)}
                    <li on:click={() => selectUser(chatUser)}>
                        {chatUser.user.username}
                        {#if selectedUser === chatUser}
                                <button>Check Profile</button>
                            {#if roleId <= 1 && roleId < chatUser.roleId}
								<button>Make Admin</button>
                            {/if}
                            {#if roleId <= 2 && roleId < chatUser.roleId}
                                <div>
                                    <button>TimeOut</button>
                                    <button on:click={() => banUser(chatUser.userId, null)} >Ban</button>
                                </div>
                            {/if}
                        {/if}
                    </li>
                {/each}
            </ul>
        {/if}
    </div>
</div>

<style lang="scss">
	#box {
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
		padding: 0.1rem 0.4rem;
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
		color: $dark-grey;
	}

	input[type='text'].message-input {
		@include tab-border(white, black);
		background-color: $light-grey;
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

	li.self .message-header {
		color: white;
	}

	li.self .message-header,
	li.self .message-content {
		align-self: flex-end;
		display: flex;
		justify-content: flex-end;
		width: 9.5rem;
	}

	li.other .message-header {
		color: $blue;
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
		@include tab-border(white, black);
		background-color: white
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

    #user-list {
        padding: 0.5rem;
        ul {
            list-style: none;
            padding: 0;
            display: flex;
            flex-direction: column;
        }
        li {
            margin-bottom: 0.2rem;
            font-size: 0.9em;
        }
    }

</style>