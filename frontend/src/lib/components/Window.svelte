<script lang="ts">
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import { Context } from '$lib/components/Context.svelte';
	import { user } from '$lib/stores';
	import LeaveGroupDialog from './app/LeaveGroupDialog.svelte';
	import Contact from './app/Contact.svelte';

	const dispatch = createEventDispatcher();
	const chatId = Context.chatId();
	const chats = Context.chats();
	const contacts = Context.contacts();
	const socket = Context.socket();
	const selected = Context.selected();
	const fetchUserById = Context.fetchUserById();

	export let props: Record<string, any>;
	export let name: string;
	export let icon: string;
	export let z = 0;
	export let parentWidth: number;
	export let parentHeight: number;
	export let visible = true;

	let top = parentHeight / 2;
	let left = parentWidth / 2;
	let width: number;
	let height: number;
	let editable = false;

	let currentChat: any;
	let chatIdLocal: number | null = $chatId;
	let typeChat: string | null = null;
	let friendUsername: string | null | undefined = '';

	let isDialogOpen = false;

	$: {
		if (top + height > parentHeight) top = parentHeight - height;
		if (left + width > parentWidth) left = parentWidth - width;
		if (top < 0) top = 0;
		if (left < 0) left = 0;

		if (name === 'Chat' || name === 'ChatForum') {
			currentChat = $chats.find((chat) => chat.id === chatIdLocal);
			if (currentChat?.isGroupChat) typeChat = 'Group';
			else {
				typeChat = 'Chat';
				if (props.friendId)
					friendUsername = $contacts.find((c) => c.id === props.friendId)?.username;
				if (currentChat && friendUsername === undefined) {
					currentChat.chatUsers.forEach((c: any) => {
						if (c.userId !== $user?.id) friendUsername = c.user.username;
					});
				}
			}
		}
	}

	let username: string | null = null;
	if (props.userId) fetchUserById(props.userId).then((data: any) => (username = data.username));

	let moving = false;
	onMount(() => {
		top -= height / 2;
		left -= width / 2;
	});

	function onMouseMove(e: MouseEvent) {
		if (!moving) return;
		left += e.movementX;
		top += e.movementY;
	}

	let prevName: string;

	function toggleEdit() {
		if (name === 'Chat') {
			if (!editable) {
				prevName = currentChat.name;
			}
			editable = !editable;
		}
	}

	function handleEdit(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			if ((e.target as HTMLInputElement).value !== prevName) {
				prevName = (e.target as HTMLInputElement).value;
				$socket.emit('changeChatName', {
					chatId: chatIdLocal,
					newName: prevName
				});
			}
			editable = false;
		}
	}

	function handleBlur() {
		currentChat.name = prevName;
		editable = false;
	}

	async function leaveGroup() {
		isDialogOpen = true;
	}

	async function leaveGroupConfirm() {
		isDialogOpen = false;
		$socket.emit('leaveGroup', { chatId: chatIdLocal });
	}
</script>

<section
	style:left={`${left}px`}
	style:top={`${top}px`}
	style:z-index={z}
	style:visibility={visible ? 'visible' : 'hidden'}
	bind:offsetWidth={width}
	bind:offsetHeight={height}
	on:mousedown
>
	<div class="border-inside">
		<div
			class="window {$selected === props.appId ? 'selected' : ''}"
			on:mousedown={() => {
				moving = true;
			}}
		>
			<img src={icon} draggable="false" />
			{#if name === 'Profile' && username}
				<p class="title">{name} of {username}</p>
			{:else if name === 'Profile'}
				<p class="title">My {name}</p>
			{:else if name === 'ChatForum' && currentChat}
				<p>Forum: {currentChat.name}</p>
			{:else if name === 'Chat' && currentChat && currentChat.isGroupChat}
				{#if editable}
					<input
						type="text"
						bind:value={currentChat.name}
						on:keydown={handleEdit}
						on:blur={handleBlur}
						autofocus
						autocomplete="off"
					/>
				{:else}
					<p id="group-chat-name" on:dblclick={toggleEdit}>{typeChat}: {currentChat.name}</p>
				{/if}
			{:else if name === 'Chat'}
				<p id="chat-name">{typeChat}: {friendUsername}</p>
			{:else}
				<p class="title">{name}</p>
			{/if}
			<div class="buttons">
				{#if name === 'Chat' && currentChat && currentChat.isGroupChat && currentChat.accessibility === 'private'}
					<button on:click={() => leaveGroup()}> LeaveGroup </button>
				{/if}
				<button on:click={() => dispatch('minimize')}>
					<div class="border-inside">_</div>
				</button>
				<button on:click={() => dispatch('close')}>
					<div class="border-inside">X</div>
				</button>
			</div>
		</div>

		<slot />
	</div>
	{#if isDialogOpen}
		<LeaveGroupDialog
			{currentChat}
			on:confirm={leaveGroupConfirm}
			on:close={() => (isDialogOpen = false)}
		/>
	{/if}
</section>

<svelte:window on:mouseup={() => (moving = false)} on:mousemove={onMouseMove} />

<style lang="scss">
	@include window-95;

	#group-chat-name {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 13rem;
		&:hover {
			cursor: url($click), auto;
		}
	}

	#group-chat-name::after {
		content: ' ✎';
		font-size: 0.8rem;
		position: relative;
		opacity: 0.7;
		color: $dark-grey;
	}

	.dialog {
		width: 18.75rem;
		height: 9.375rem;
		border: 0.0625rem solid black;
		background-color: $grey;
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		padding: 1.25rem;
		button {
			margin-top: 1.25rem;
			margin-right: 0.625rem;
			padding: 0.3rem;
			float: right;
		}
		p {
			margin-bottom: 1.25rem;
			font-size: 1rem;
		}
	}
	.selected {
		background-color: $blue !important;
	}

	img {
		scale: 110%;
	}
</style>
