<script lang="ts">
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import { Context } from '$lib/components/Context.svelte';
	import type { Socket } from 'socket.io-client';

	const dispatch = createEventDispatcher();
	const chatId = Context.chatId();
	const chats = Context.chats();
	const socket = Context.socket();

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
	let socketInstance: Socket | null = null;

	$: {
		if (top + height > parentHeight) top = parentHeight - height;
		if (left + width > parentWidth) left = parentWidth - width;
		if (top < 0) top = 0;
		if (left < 0) left = 0;

		if (name === 'Chat') {
			currentChat = $chats.find((chat) => chat.id === chatIdLocal);
			if (currentChat?.isGroupChat) typeChat = 'Group';
			else typeChat = 'Chat';
		}
	}

	let moving = false;
	onMount(() => {
		socket.subscribe(($socket) => {
			socketInstance = $socket;
		});

		top -= height / 2;
		left -= width / 2;
	});

	function onMouseMove(e: MouseEvent) {
		if (!moving) return;
		left += e.movementX;
		top += e.movementY;
	}

	let prevName: string;
	let dialog: HTMLDialogElement;
	let isDialogOpen = false;

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
				if (socketInstance) {
					socketInstance.emit('changeChatName', {
						chatId: chatIdLocal,
						newName: prevName
					});
				}
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
		dialog.showModal();
	}

	async function leaveGroupConfirm() {
		isDialogOpen = false;
		dialog.close();
		if (socketInstance) socketInstance.emit('leaveGroup', { chatId: chatIdLocal });
	}
</script>

<head>
	<link
		href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.1/css/all.min.css"
		rel="stylesheet"
	/>
</head>

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
			class="window"
			on:mousedown={() => {
				moving = true;
			}}
		>
			<img src={icon} draggable="false" />
			{#if name === 'Profile' && props.username}
				<p>{name} of {props.username}</p>
			{:else if name === 'Profile'}
				<p>My {name}</p>
			{:else if name === 'Chat' && currentChat && currentChat.isGroupChat}
				{#if editable}
					<input
						type="text"
						bind:value={currentChat.name}
						on:keydown={handleEdit}
						on:blur={handleBlur}
						autofocus
					/>
				{:else}
					<p id="group-chat-name" on:dblclick={toggleEdit}>{typeChat}: {currentChat.name}</p>
				{/if}
			{:else if name === 'Chat' && currentChat && !currentChat.isGroupChat}
				<p id="chat-name">{typeChat}: {props.name}</p>
			{:else}
				<p>{name}</p>
			{/if}
			<div class="buttons">
				{#if name === 'Chat' && currentChat && currentChat.isGroupChat}
					<button on:click={() => leaveGroup()}>
						<i class="fas fa-sign-out-alt" />
						<dialog bind:this={dialog} class="dialog" open={isDialogOpen}>
							<p>Voulez-vous vraiment quitter le groupe {currentChat?.name} ?</p>
							<button on:click={() => leaveGroupConfirm()}>Oui</button>
							<button
								on:click|stopPropagation={() => {
									isDialogOpen = false;
									dialog.close();
								}}>Non</button
							>
						</dialog>
					</button>
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
</section>

<svelte:window on:mouseup={() => (moving = false)} on:mousemove={onMouseMove} />

<style lang="scss">
	@include window-95;

	#group-chat-name {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 8.5rem;
	}

	#group-chat-name::after {
		content: ' ✎';
		font-size: 0.8rem;
		position: relative;
		opacity: 0.7;
		color: rgb(71, 71, 71);
	}

	.dialog {
		width: 18.75rem;
		height: 9.375rem;
		border: 0.0625rem solid #000;
		background-color: #c0c0c0;
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		padding: 1.25rem;
	}

	.dialog button {
		margin-top: 1.25rem;
		margin-right: 0.625rem;
		padding: 0.3rem;
		float: right;
	}

	.dialog p {
		margin-bottom: 1.25rem;
		font-size: 1rem;
	}
</style>
