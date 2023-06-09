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
	let chatIsLocal: number | null = $chatId;
	let typeChat: string | null = null;
	let socketInstance: Socket | null = null;

	$: {
		if (top + height > parentHeight) top = parentHeight - height;
		if (left + width > parentWidth) left = parentWidth - width;
		if (top < 0) top = 0;
		if (left < 0) left = 0;

		if (name === 'Chat') {
			currentChat = $chats.find((chat) => chat.id === chatIsLocal);
			if (currentChat?.isGroupChat)
				typeChat = 'Group';
			else
				typeChat = 'Chat';
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
						chatId: chatIsLocal,
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
			{:else if name === 'Chat' && currentChat.isGroupChat}
				{#if editable}
				<input type="text" bind:value={currentChat.name} on:keydown={handleEdit} on:blur={handleBlur} autofocus />
				{:else}
					<p id="group-chat-name" on:dblclick={toggleEdit}>{typeChat}: {currentChat.name}</p>
				{/if}
			{:else if name === 'Chat' && !currentChat.isGroupChat}
				<p id="chat-name">{typeChat}: {props.name}</p>
			{:else}
				<p>{name}</p>
			{/if}
			<div class="buttons">
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

	#group-chat-name::after {
		content: " ✎";
		font-size: 0.8rem;
		position: relative;
		opacity: 0.7;
		color: rgb(71, 71, 71);
	}



</style>
