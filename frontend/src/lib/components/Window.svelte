<script lang="ts">
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let props: Record<string, any>;

	export let tabName: string;
	export let tabIcon: string;

	export let z = 0;

	export let parentWidth: number;
	export let parentHeight: number;

	export let visible = true;

	let top = parentHeight / 2;
	let left = parentWidth / 2;

	let width: number;
	let height: number;

	$: {
		if (top + height > parentHeight) top = parentHeight - height;
		if (left + width > parentWidth) left = parentWidth - width;
		if (top < 0) top = 0;
		if (left < 0) left = 0;
	}

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
	console.log('yo');
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
	<div
		on:mousedown={() => {
			moving = true;
		}}
	>
		<img src={tabIcon} draggable="false" />
		{#if tabName === 'Profile' && props.username}
			<p>{tabName}{props.username}</p>
		{:else if tabName === 'Profile'}
			<p>My {tabName}</p>
		{:else}
			<p>{tabName}</p>
		{/if}
		<div class="buttons">
			<button on:click={() => dispatch('minimize')}>_</button>
			<button on:click={() => dispatch('close')}>X</button>
		</div>
	</div>
	<slot />
</section>

<svelte:window on:mouseup={() => (moving = false)} on:mousemove={onMouseMove} />

<style lang="scss">
	section {
		position: absolute;
		top: 5rem;
		left: 5rem;
		border: 0.2rem solid black;
		user-select: none;
		@include tab-contour;
		background-color: $grey;
		& > div {
			display: flex;
			height: 1.5rem;
			margin: 0.2rem 0.2rem;
			background-color: $dark-grey;
			align-items: center;

			&:hover {
				cursor: url($grab), auto;
			}

			.buttons {
				margin-left: auto;
				margin-right: 0.2rem;
			}
		}

		img {
			margin-left: 0.5rem;
			height: 1rem;
			width: auto;
		}

		p {
			padding: 0.25rem;
			color: $light-grey;
			font-weight: bolder;
		}

		button {
			@include tab-contour;
			@include tab-contour-active;
			padding: 0 0.25rem;
			background-color: $grey;
		}
	}
</style>
