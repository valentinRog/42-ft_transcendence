<script lang="ts">
	import { onMount } from 'svelte';
	import { Context } from '$lib/components/Context.svelte';
	import { user } from '$lib/stores';
	import PasswordDialog from './PasswordDialog.svelte';

	const chatId = Context.chatId();
	const chats = Context.chats();
	const chatsPublic = Context.chatsPublic();
	const fetchPublicChats = Context.fetchPublicChats();
	const fetchCreateChat = Context.fetchCreateChat();
	const fetchChatById = Context.fetchChatById();
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
	let dialogOpen = false;

	onMount(async () => {
		await fetchPublicChats(start, limit).then(({chats, totalChatsCount}) => {
			chatsCount = totalChatsCount;
		});
	});


	const createChat = async () => {
		if (groupName.trim() === '' || ['public', 'protected'].indexOf(accessibility) < 0) {
			return;
		}
		const chat = await fetchCreateChat(groupName, [$user?.username], true, accessibility, password);
		$chats = [...$chats, chat];
		$chatId = chat.id;
		$openChatForumWindow = true;
	};

	async function startChat(chat: Context.Chat) {
		const updatedChat = await fetchChatById(chat.id);
		if (
			updatedChat.accessibility === 'protected' &&
			!updatedChat.chatUsers.find((c: any) => c.userId === $user?.id)
		) {
			selectedChat = updatedChat;
			dialogOpen = true;
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

	function switchView(view: string) {
		if (view === 'my') selectedChat = null;
		currentView = view;
	}

	const previousChats = async () => {
		if (start > 0) {
			start -= limit;
			await fetchPublicChats(start, limit).then(({chats, totalChatsCount}) => {
				chatsCount = totalChatsCount;
			});
		}
	};

	const nextChats = async () => {
		start += limit;
		await fetchPublicChats(start, limit).then(({chats, totalChatsCount}) => {
			chatsCount = totalChatsCount;
		});
	};

	const refreshChats = async () => {
		start = 0;
		await fetchPublicChats(start, limit).then(({chats, totalChatsCount}) => {
			chatsCount = totalChatsCount;
		});
	};

</script>

<div id="box">
	<div class="create-Chat">
		<h4>Add New Topic</h4>
		<form on:submit|preventDefault={createChat}>
			<label>
				Topic Name :
				<input type="text" bind:value={groupName} required autocomplete="off" />
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
		<div class="public-topic-header">
			<h3>Public Topics</h3>
			<img src="./refresh.png" class="refresh-button" on:click={refreshChats}>
		</div>
		<div class="chat-windows">
			<ul>
				{#each $chatsPublic as chat (chat.id)}
					<div class="chat">
						<li on:click={() => startChat(chat)}>
							<div class="chat-item">
								{#if chat.accessibility === "protected" && !chat.chatUsers.find(c => c.userId === $user?.id)}
									<img src="padlock.png">
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
				{#if start + limit < chatsCount}
					<button on:click={nextChats}>Next</button>
				{/if}
			</div>
			{#if selectedChat !== null}
				{#if dialogOpen}
					<PasswordDialog {selectedChat} {chatPassword} on:close={() => (dialogOpen = false)}/>
				{/if}

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
	@include form-95;

	input {
		height : 21px;
	}

	select {
		width: 100px;
		bottom: 0.1rem;
		height: 21px;
	}

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

	button {
		@include button-95;

		padding: 0.5rem;
		margin-bottom: 0.2rem;
		width: 8rem;
		font-size: 0.9rem;
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


	img {
		margin-right: 0.3rem;
	}

	.public-topic-header {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.refresh-button {
		position: absolute;
		left: 8rem;
		width: 1rem;
		height: 1rem;
	}


</style>
