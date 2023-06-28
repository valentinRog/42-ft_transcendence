<script lang="ts">
	import { onMount, onDestroy, afterUpdate } from 'svelte';
	import { Context } from '$lib/components/Context.svelte';
	import { user } from '$lib/stores';

	const socket = Context.socket();
	const chats = Context.chats();
	const chatId = Context.chatId();
	const blocks = Context.blocks();
	const selected = Context.selected();
	const fetchUserByUsername = Context.fetchUserByUsername();
	const addInstance = Context.addInstance();

	let currentChat: any = null;
	let blockedIds: number[];
	let selectedUser: any = null;
	let chatIdLocal: number | null = $chatId;
	let messageContent = '';
	let roleId: number;
	let disabled = false;
	let sortedChatUsers : any;

	let searchQuery = '';
	let selectedAction: string = '';
	let RoleName: string[] = ["Admin", "Moderator", "User"];

	let chatWindow: HTMLDivElement;
	let autoScroll = true;

	//BAN AND MUTE
	let isUserBanned = false;
	let isUserMuted = false;

	let banExpiresAt: Date | null = null;
	let muteExpiresAt: Date | null = null;

	let banDuration: number | null = null;
	let muteDuration: number | null = null;

	let actionDuration: number | null = null;

	//PASSWORD
	let password: any = undefined;
	let passwordModalVisible = false;
	let isProtected: any;

	$: {
		
		blockedIds = $blocks.map(block => block.blockedId);
		currentChat = $chats.find((chat) => chat.id === chatIdLocal);
		sortedChatUsers = currentChat.chatUsers.slice().sort((a : any, b : any) => a.roleId - b.roleId);
		roleId = currentChat?.chatUsers.find((cu: any) => cu.userId === $user?.id)?.roleId;
		isProtected = currentChat ? currentChat.accessibility === 'protected' : false;
		disabled = isUserBanned || isUserMuted;
	}

	onMount(() => {
		if (currentChat && currentChat.bans) {
			const ban = currentChat.bans.find(
				(ban: any) =>
					ban.userId === $user?.id &&
					(ban.expiresAt == null || new Date(ban.expiresAt) > new Date())
			);

			isUserBanned = !!ban;
			if (isUserBanned) {
				banExpiresAt = ban.expiresAt ? new Date(ban.expiresAt) : null;
				return;
			}

			const mute = currentChat.mutes.find(
				(mute: any) =>
					mute.userId === $user?.id &&
					(mute.expiresAt == null || new Date(mute.expiresAt) > new Date())
			);

			isUserMuted = !!mute;
			if (isUserMuted) muteExpiresAt = mute.expiresAt ? new Date(mute.expiresAt) : null;
			$socket.emit('joinRoom', { chatId: chatIdLocal });
		}
	});

	onDestroy(() => {
		$socket.emit('leaveRoom', { chatId: chatIdLocal });
	});

	const actions = {
		Moderator: (userId: number) => {
			changeRole(userId, 2);
		},
		User: (userId: number) => {
			changeRole(userId, 3);
		},
		ban: (userId: number) => {
			banUser(userId, actionDuration);
		},
		unban: (userId: number) => {
			unBanUser(userId);
		},
		mute: (userId: number) => {
			muteUser(userId, actionDuration);
		},
		unmute: (userId: number) => {
			unMuteUser(userId);
		}
	};

	const performAction = async () => {
		if (searchQuery.trim() === '') return;
		const user = await fetchUserByUsername(searchQuery);
		const userId = user.id;
		const isInChat = currentChat.chatUsers.some((c : any) => c.userId === userId);

		if (!isInChat && (selectedAction === "User" || selectedAction === "Moderator"))
			return;

		if (userId && actions[selectedAction as keyof typeof actions])
			actions[selectedAction as keyof typeof actions](userId);
	};

	function openProfile(userId: number) {
		addInstance('Profile', {}, { userId });
		$selected = null;
	}

	function openPasswordModal() {
		passwordModalVisible = true;
	}

	function closePasswordModal() {
		passwordModalVisible = false;
		password = undefined;
	}

	async function toggleAccess() {
		if (!isProtected && !currentChat.password && !password) openPasswordModal();
		else {
			$socket.emit('setAccess', { chatId: chatIdLocal, isProtected, password });
			password = undefined;
			closePasswordModal();
			isProtected = !isProtected;
		}
	}

	async function changePassword() {
		if (password) {
			$socket.emit('setPassword', { chatId: chatIdLocal, password });
			password = undefined;
		}
	}

	function updatePassword(event: any) {
		password = event.target.value;
	}

	async function sendMessage() {
		if (messageContent.trim() === '') return;
		$socket.emit('sendMessage', {
			chatId: chatIdLocal,
			content: messageContent
		});
		messageContent = '';
	}

	function selectUser(user: any) {
		if (selectedUser && selectedUser.id === user.id)
			selectedUser = null;
		else
			selectedUser = user;
	}

	function changeRole(userId: number, newRoleId: number) {
		$socket.emit('changeRole', { chatId: chatIdLocal, userId, newRoleId });
	}

	function banUser(userId: number, duration: number | null) {
		$socket.emit('banUser', { chatId: chatIdLocal, userId, duration: banDuration });
	}

	function unBanUser(userId: number) {
		$socket.emit('unBanUser', { chatId: chatIdLocal, userId });
	}

	function muteUser(userId: number, duration: number | null) {
		$socket.emit('muteUser', { chatId: chatIdLocal, userId, duration: muteDuration });
	}

	function unMuteUser(userId: number) {
		$socket.emit('unMuteUser', { chatId: chatIdLocal, userId });
	}

	$socket.on('userBan', (data: any) => {
		if (data.chatId === chatIdLocal) {
			isUserBanned = true;
			banExpiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
		}
	});

	$socket.on('userMute', (data: any) => {
		if (data.chatId === chatIdLocal) {
			isUserMuted = true;
			muteExpiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
		}
	});

	$socket.on('userUnBan', (data: any) => {
		if (data.chatId === chatIdLocal) {
			isUserBanned = false;
		}
	});

	$socket.on('userUnMute', (data: any) => {
		if (data.chatId === chatIdLocal) {
			isUserMuted = false;
		}
	});

	$socket.on('chatUserAdded', (data: any) => {
		if (data.chatId === chatIdLocal) {
			currentChat.chatUsers = [...currentChat.chatUsers, data.chatUser];
		}
	});

	$socket.on('updateRole', (data: any) => {
		if (data.chatId === chatIdLocal) {
			if ($user?.id === data.userId)
				roleId = data.newRoleId;
			currentChat.chatUsers.forEach((chatUser: any) => {
				if (chatUser.userId === data.userId) {
					chatUser.roleId = data.newRoleId;
				}
			});
			currentChat.chatUsers = [...currentChat.chatUsers];
		}
	});

	function handleScroll() {
		if (chatWindow.scrollTop + chatWindow.clientHeight + 1 >= chatWindow.scrollHeight) {
			autoScroll = true;
		} else {
			autoScroll = false;
		}
	}

	afterUpdate(() => {
		if (autoScroll) chatWindow.scrollTop = chatWindow.scrollHeight;
	});


</script>

<div id="box">
	<div class="chat-container">
		<div id="chat-window" bind:this={chatWindow} on:scroll={handleScroll}>
			{#if isUserBanned}
				<p>
					You are banned from this Topics {banExpiresAt
						? `until ${banExpiresAt.toLocaleString()}`
						: 'indefinitely'}.
				</p>
			{:else}
				<ul>
					{#if currentChat}
						{#each currentChat?.messages || [] as message, i (i)}
							{#if !blockedIds.includes(message.userId)}
								<li class={message.user?.username === $user?.username ? 'self' : 'other'}>
									<div class="message-header">
										{#if (i > 0 && currentChat?.messages[i - 1] && currentChat?.messages[i - 1].userId != message.userId) || i === 0}
											<strong on:click={() => openProfile(message.userId)}
												>{message.user?.username}</strong
											>
										{/if}
									</div>
									<div class="message-content">{message.content}</div>
								</li>
							{/if}
						{/each}
					{/if}
				</ul>
			{/if}
		</div>
		<div id="sendMessage-window">
			{#if isUserMuted}
				<p>
					You are muted in this Topics {muteExpiresAt
						? `until ${muteExpiresAt.toLocaleString()}`
						: 'indefinitely'}.
				</p>
			{:else}
				<form on:submit|preventDefault={sendMessage} class="send-message-form">
					<input type="text" bind:value={messageContent} class="message-input" {disabled} autocomplete="off" />
					<button type="submit" class="btn send-btn" {disabled}>Send</button>
				</form>
			{/if}
		</div>
	</div>
	{#if !isUserMuted && !isUserBanned}
		<div id="user-list">
			<div class="admin-mode">
				{#if roleId <= 2}
					<div class="username-action-row">
						<input type="text" bind:value={searchQuery} placeholder="username" autocomplete="off"/>
						<select bind:value={selectedAction}>
							<option value="">Action</option>
							{#if roleId <= 1}
								<option value="Moderator">Moderator</option>
								<option value="User">User</option>
							{/if}
							<option value="ban">Ban</option>
							<option value="unban">unBan</option>
							<option value="mute">Mute</option>
							<option value="unmute">unMute</option>
						</select>
					</div>
					{#if selectedAction === 'ban' || selectedAction === 'mute'}
						<div class="duration-submit-row">
							<input
								type="number"
								class="duration-input"
								bind:value={actionDuration}
								placeholder="in sec"
								min="0"
							/>
							
						</div>
					{/if}
					<div class="submit-row">
						<button on:click={performAction}>Submit</button>
					</div>
					<div id="access-control">
						{#if roleId === 1}
							{#if isProtected}
								<button class="switch" on:click={toggleAccess}>Switch to Public</button>
								<div id="password-change-form">
									<label>
										Enter new password:
										<input type="password" bind:value={password} on:input={updatePassword} autocomplete="off"/>
									</label>
									<button on:click={changePassword}>Submit</button>
								</div>
							{:else}
								<button class="switch" on:click={toggleAccess}>Switch to Protected</button>
							{/if}
						{/if}
						{#if passwordModalVisible}
							<div id="password-modal">
								<label>
									{#if isProtected}
										<p>Enter new password:</p>
									{:else}
										<p>Enter password to switch to Protected:</p>
									{/if}
									<input type="password" on:input={updatePassword} autocomplete="off" />
								</label>
								<button on:click={toggleAccess}>Submit</button>
								<button on:click={closePasswordModal}>Cancel</button>
							</div>
						{/if}
					</div>
				{/if}
			</div>
			{#if currentChat}
				<div class="users">
					<h5>Users in this chat:</h5>
					<ul>
						{#each sortedChatUsers as chatUser, index (index)}
							<li>
								<div on:click={() => selectUser(chatUser)}>
									({RoleName[chatUser.roleId - 1]}) {chatUser.user?.username}
								</div>
								{#if selectedUser === chatUser}
									<button on:click={() => openProfile(chatUser.userId)}>Check Profile</button>
									{#if roleId <= 1 && roleId < chatUser.roleId}
										{#if chatUser.roleId === 3}
											<button on:click={() => changeRole(chatUser.userId, 2)}>Made Moderator</button>
										{:else if chatUser.roleId === 2}
											<button on:click={() => changeRole(chatUser.userId, 3)}>Make User</button>
										{/if}
									{/if}
									{#if roleId <= 2 && roleId < chatUser.roleId}
										<div>
											<button on:click={() => muteUser(chatUser.userId, null)}>Mute</button>
											<button on:click={() => banUser(chatUser.userId, null)}>Ban</button>
											<button on:click={() => unMuteUser(chatUser.userId)}>Unmute</button>
											<button on:click={() => unBanUser(chatUser.userId)}>Unban</button>
											<input class="duration-input"
												type="number"
												bind:value={banDuration}
												placeholder="Ban duration in seconds"
												min="0"
												autocomplete="off"
											/>
											<input class="duration-input"
												type="number"
												bind:value={muteDuration}
												placeholder="Mute duration in seconds"
												min="0"
												autocomplete="off"
											/>
										</div>
									{/if}
								{/if}
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style lang="scss">
	#box {
		width: 30rem;
		height: 17rem;
	}

	.chat-container {
		float: left;
		height: 17rem;
		width: 20rem;
	}

	.duration-input {
		width: 4rem;
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

	#user-list {
		margin-left: 20.3rem;
		overflow-y: auto;
		overflow-x: hidden;
		height: 17rem;
	}

	.btn {
		padding: 0.1rem 0.4rem;
	}

	.send-btn {
		margin-left: auto;
		order: 2;
	}

	h5 {
		margin-top: 0.5rem;
		margin-bottom: 0.8rem;
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
		background-color: white;
	}

	.send-message-form {
		display: flex;
		width: 100%;
	}

	p {
		text-align: center;
		font-size: 0.9rem;
	}

	.admin-mode {
		display: flex;
		flex-direction: column;
		align-items: start;
	}

	.admin-mode input[type="text"],
	.admin-mode select,
	.admin-mode .duration-input {
		width: 100%;
		padding: 2px;
		margin-bottom: 2px;
		box-sizing: border-box;
	}

	.admin-mode .duration-input {
		width: 3.5rem;
	}

	.admin-mode button {
		margin-top: 5px;
		padding: 3px 7px;
	}

	#access-control {
		margin-top: 10px;
		display: flex;
		flex-direction: column;
	}

	#password-change-form, 
	#password-modal {
		margin-top: 0.8rem;
		text-align: center;
		flex-direction: column;
		font-size: 0.9rem;
		button {
			width: 3rem;
			margin-left: auto;
			margin-right: auto;
		}
	}

	.username-action-row,
	.duration-row,
	.submit-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 10px;
	}

</style>
