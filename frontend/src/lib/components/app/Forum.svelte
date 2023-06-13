<script lang="ts">
	import { onMount, afterUpdate } from 'svelte';
	import { Context } from '$lib/components/Context.svelte';
	import { user } from '$lib/stores';
	import Contact from './Contact.svelte';
	import { logout } from '$lib/utils/connect';

    const socket = Context.socket();
    const chatId = Context.chatId();
    const chats = Context.chats();
	const chatsPublic = Context.chatsPublic();
	const fetchPublicChats = Context.fetchPublicChats();
	const fetchChats = Context.fetchChats();
    const openChatForumWindow = Context.openChatForumWindow();

	let currentView = 'public';
	let start = 0;
	const limit = 5;
	let groupName = "";
	let password = "";
	let accessibility = "public";
	let selectedChat: any = null;
    let chatPassword = "";

	onMount(() => {
		fetchPublicChats(start, limit);
	});

	const createChat = async () => {
		if (groupName.trim() === "" || ["public", "protected"].indexOf(accessibility) < 0) {
			// handle validation errors
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
	}

	function startChat(chat : Context.Chat) {
        if (chat.accessibility === 'protected' 
			&& !chat.chatUsers.find((c: any) => c.user.username === $user?.username)) {
            selectedChat = chat;
        } else {
            $chatId = chat.id;
            $openChatForumWindow = true;
        }
    }

	function enterChat() {
        if (chatPassword === selectedChat.password) {
            $chatId = selectedChat.id;
			$socket.emit('joinChat', { chatId: selectedChat.id, userId: $user?.id });
            $openChatForumWindow = true;
            selectedChat = null;
            chatPassword = "";
        } else {
            alert("Wrong password");
        }
    }

	function switchView(view: string) {
		if (view === "my")
			selectedChat = null;
		currentView = view;
	}

	function nextChats() {
		start += limit;
		fetchPublicChats(start, limit);
	}
</script>

<div id="box">
    <h3>add new Topic</h3>
	<form on:submit|preventDefault={createChat}>
		<label>
			Topic Name :
			<input type="text" bind:value={groupName} required>
		</label>
		<label>
			Access :
			<select bind:value={accessibility}>
				<option value="public">Public</option>
				<option value="protected">Protected by password</option>
			</select>
		</label>
		{#if accessibility === 'protected'}
			<label>
				Password :
				<input type="password" bind:value={password} required>
			</label>
		{/if}
		<button type="submit">Créer un chat</button>
	</form>
	<button on:click={() => switchView('public')}>Public Topics</button>
	<button on:click={() => switchView('my')}>My Topics</button>
	{#if currentView === 'public'}
    <h3>Public Topics</h3>
		<ul>
			{#each $chatsPublic as chat (chat.id)}
				<li>
					<span on:click={() => startChat(chat)}>{chat.name}</span>
				</li>
			{/each}
		</ul>
	{:else if currentView === 'my'}
		<h3>My Topics</h3>
		<ul>
			{#each $chats as chat (chat.id)}
				{#if chat.accessibility !== 'private'}
					<li on:click={() => startChat(chat)}>{chat.name}</li>
				{/if}
			{/each}
		</ul>
	{/if}

{#if selectedChat !== null}
    <label>
        Enter Password for {selectedChat.name} :
        <input type="password" bind:value={chatPassword} required>
        <button on:click={enterChat}>Enter</button>
    </label>
{/if}
</div>

<style lang="scss">
	#box {
		background: #c0c0c0;
		color: #000;
		font-family: 'MS Sans Serif', sans-serif;
		box-shadow: 1px 1px 5px 1px rgba(0, 0, 0, 0.5);
		width: 30rem;
		height: 17rem;
	}
</style>
