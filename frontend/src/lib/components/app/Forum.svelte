<script lang="ts">
	import { onMount, afterUpdate } from 'svelte';
	import { Context } from '$lib/components/Context.svelte';
	import { user } from '$lib/stores';

    const socket = Context.socket();
    const chatId = Context.chatId();
    const chats = Context.chats();
    const openChatWindow = Context.openChatWindow();

	let groupName = "";
	let password = "";
	let confirmPassword = "";
	let accessibility = "public"; // default value

	const createChat = async () => {
		if (groupName.trim() === "" || password !== confirmPassword || ["public", "protected"].indexOf(accessibility) < 0) {
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
			$openChatWindow = true;
		});
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
			<label>
				Confirm password :
				<input type="password" bind:value={confirmPassword} required>
			</label>
		{/if}
		<button type="submit">Créer un chat</button>
	</form>
     <!-- Public chats -->
     <h3>Public Topics</h3>
     <ul>
         <!-- {#each publicChats as chat (chat)}
             <li>{chat}</li>
         {/each} -->
     </ul>
 
     <!-- My chats public-->
     <h3>My Topics</h3>
     <ul>
        {#each $chats as chat (chat.id)}
            {#if chat.accessibility !== 'private'}
                <li>{chat.name}</li>
            {/if}
        {/each}
    
     </ul>
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
