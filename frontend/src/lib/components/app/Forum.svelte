<script lang="ts">
	import { onMount } from 'svelte';
	import { Context } from '$lib/components/Context.svelte';
	import { user } from '$lib/stores';

	const socket = Context.socket();
	const chatId = Context.chatId();
	const chats = Context.chats();
	const chatsPublic = Context.chatsPublic();
	const fetchPublicChats = Context.fetchPublicChats();
	const fetchChatById = Context.fetchChatById();
	const fetchVerifyPassword = Context.fetchVerifyPassword();
	const openChatForumWindow = Context.openChatForumWindow();

	let currentView = 'public';
	let start = 0;
	const limit = 5;
	let groupName = '';
	let password = '';
	let accessibility = 'public';
	let selectedChat: any = null;
	let chatPassword = '';
	let chatsCount = 0;

	onMount(() => {
		fetchPublicChats(start, limit).then((chats) => (chatsCount = chats.length));
	});

	const createChat = async () => {
		if (groupName.trim() === '' || ['public', 'protected'].indexOf(accessibility) < 0) {
			return;
		}
		$socket.emit('createGroupChat', {
			groupName: groupName,
			memberUsernames: [$user?.username],
			isGroupChat: true,
			accessibility: accessibility,
			password: password
		});
		$socket.on('createChat', (chatNumber: number) => {
			$chatId = chatNumber;
			$openChatForumWindow = true;
		});
	};

	async function startChat(chat: Context.Chat) {
		const updatedChat = await fetchChatById(chat.id);
		if (
			updatedChat.accessibility === 'protected' &&
			!updatedChat.chatUsers.find((c: any) => c.userId === $user?.id)
		) {
			selectedChat = updatedChat;
		} else {
			if ($chats.find((c: any) => c.id === updatedChat.id))
				$chats.splice(
					$chats.findIndex((c: any) => c.id === updatedChat.id),
					1
				);
			$chats.push(updatedChat);
			$chatId = chat.id;
			$openChatForumWindow = true;
		}
	}

	async function enterChat() {
		const isValidPassword = await fetchVerifyPassword(selectedChat.id, chatPassword);

		if (isValidPassword) {
			$chatId = selectedChat.id;
			$socket.emit('joinChat', { chatId: selectedChat.id, userId: $user?.id });
			$openChatForumWindow = true;
			selectedChat = null;
			chatPassword = '';
		} else {
			alert('Wrong password');
		}
	}

	function switchView(view: string) {
		if (view === 'my') selectedChat = null;
		currentView = view;
	}

	function previousChats() {
		if (start > 0) {
			start -= limit;
			fetchPublicChats(start, limit).then((chats) => (chatsCount = chats.length));
		}
	}

	function nextChats() {
		start += limit;
		fetchPublicChats(start, limit).then((chats) => (chatsCount = chats.length));
	}
</script>

<div id="box">
	<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.15.3/css/all.css">
	<div class="create-Chat">
		<h4>Add New Topic</h4>
		<form on:submit|preventDefault={createChat}>
			<label>
				Topic Name :
				<input type="text" bind:value={groupName} required />
			</label>
			<label>
				Access :
				<select bind:value={accessibility}>
					<option value="public">Public</option>
					<option value="protected">Protected</option>
				</select>
			</label>
			{#if accessibility === 'protected'}
				<label>
					Password :
					<input type="password" bind:value={password} required />
				</label>
			{/if}
			<button type="submit">Create Chat</button>
		</form>
	</div>
	<div class="change-page">
		<button on:click={() => switchView('public')}>Public Topics</button>
		<button on:click={() => switchView('my')}>My Topics</button>
	</div>
	{#if currentView === 'public'}
		<h3>Public Topics</h3>
		<div class="chat-windows">
			<ul>
				{#each $chatsPublic as chat (chat.id)}
					<div class="chat">
						<li on:click={() => startChat(chat)}>
							<div class="chat-item">
								{#if chat.accessibility === "protected" && !chat.chatUsers.find(c => c.userId === $user?.id)}
									<h6>logo lock</h6>
								{/if}
								<span>{chat.name}</span>
							</div>
						</li>
					</div>
				{/each}
			</ul>
			<div class="change-page">
				{#if start >= limit}
					<button on:click={previousChats}>Previous</button>
				{/if}
				{#if chatsCount === limit}
					<button on:click={nextChats}>Next</button>
				{/if}
			</div>
			{#if selectedChat !== null}
				<label>
					Enter Password for {selectedChat.name} :
					<input type="password" bind:value={chatPassword} required />
					<button on:click={enterChat}>Enter</button>
				</label>
			{/if}
		</div>
	{:else if currentView === 'my'}
		<h3>My Topics</h3>
		<div class="chat-windows">
			<ul>
				{#each $chats as chat (chat.id)}
					{#if chat.accessibility !== 'private'}
						<li class="chat" on:click={() => startChat(chat)}>{chat.name}</li>
					{/if}
				{/each}
			</ul>
		</div>
	{/if}
</div>

<style lang="scss">
	#box {
		width: 25rem;
		height: 32rem;
	}

	@include select-95;

	.chat-window {
		overflow-x: hidden;
		margin: 0.2rem;
		padding: 0.3rem;
	}

	.chat {
		@include tab-border($light-grey, $dark-grey);
		padding: 0.5rem;
		height: 3rem;
		font-size: 1.3rem;
		margin-bottom: 0.3rem;
	}

	.change-page {
		display: flex;
		justify-content: center;
		gap: 0.5rem;
	}

	h3,
	h4 {
		color: $blue;
		margin-bottom: 0.5rem;
		text-align: center;
	}

	h3 {
		margin-top: 1rem;
	}

	.create-Chat,
	button {
		@include tab-border($light-grey, $dark-grey);
		padding: 0.5rem;
		margin-bottom: 0.2rem;
	}

	ul {
		min-height: 18rem;
		max-height: 20rem;
		overflow-y: auto;
		overflow-x: hidden;
		margin: 0.2rem;
		padding: 0.3rem;
	}

	li {
		position: relative;
		display: flex;
		justify-content: space-between;
	}

	li span {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 20rem;
		margin-bottom: 0.2rem;
	}

	.chat-item {
		display: flex;
		align-items: center;
	}

</style>
