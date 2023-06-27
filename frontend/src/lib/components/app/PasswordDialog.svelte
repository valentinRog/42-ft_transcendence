
<script lang="ts">
	import ErrorDialog from '$lib/components/ErrorDialog.svelte';
	import { Context } from '$lib/components/Context.svelte';

	const socket = Context.socket();
	const fetchVerifyPassword = Context.fetchVerifyPassword();
	const chatId = Context.chatId();
	const chats = Context.chats();
	const openChatForumWindow = Context.openChatForumWindow();

	export let selectedChat: any;
	export let chatPassword: string;

	let dialog: HTMLDialogElement;
	let showModal = false;
	let errorMessage: string | null = null;

	$: if (dialog) dialog.showModal();

	async function handleOK() {
		const isValidPassword = await fetchVerifyPassword(selectedChat.id, chatPassword);

		if (isValidPassword) {
			$chatId = selectedChat.id;
			$chats.push(selectedChat);
			$socket.emit('joinRoom', { chatId: selectedChat.id });
			$openChatForumWindow = true;
			dialog.close();
		} else {
			errorMessage = 'Invalid Password';
			showModal = true;
		}
	}

</script>


<dialog bind:this={dialog} on:close>
	<ErrorDialog {showModal} {errorMessage} on:close={() => (showModal = false)} />

		<div class="top-bar">
			<div class="topbutton">
				<button on:click={() => dialog.close()}>
					<div class="border-inside">&nbspX&nbsp</div>
				</button>
			</div>
		</div>
	<div class="form-group">
		<label>
			Enter Password for {selectedChat.name} :
			<input type="password" bind:value={chatPassword} required />
		</label>
	</div>
	<div class="buttons" on:click|stopPropagation>
		<button on:click={handleOK}>OK</button>
		<button on:click={() => dialog.close()}>Cancel</button>
	</div>
</dialog>


<style lang="scss">

	@include form-95;

	.form-group {

		label {
			font-size: 1.1rem;
			margin-bottom: 0.5rem;
		}

		input:focus {
			outline: none;
			border-bottom: 1.5px solid #000;
		}

		padding: 0.8em;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
	}

	.buttons {

		display: flex;
		justify-content: center;
		margin-top: 1rem;
	}

	dialog {
		@include tab-contour;
		padding: 0;
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background-color: $grey;
	}

	dialog > div > button {
		@include tab-contour;
		@include tab-contour-active;
		background-color: $grey;
		margin-bottom: 12px;
		margin-left: 0.6rem;
		margin-right: 0.6rem;
		width: 5rem;
		padding: 0.3rem;
	}

	div.top-bar {
		background-color: $blue;
		height: 1.5rem;
		display: flex;
		align-items: center;

		.topbutton {
			margin-left: auto;
			margin-right: 0.2rem;
		}
	}

	div.content {
		padding: 1rem;
		a {
			display: flex;
			flex-direction: column;
		}
	}
</style>
