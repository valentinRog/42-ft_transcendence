<script lang="ts">
	import DropDown from '$lib/components/drop/DropDown.svelte';

	let textareaValue = '';

	function clear() {
		textareaValue = '';
	}

	let activeDrop: string | null = null;
</script>

<div class="window-body">
	<div class="menu">
		<DropDown name="File" bind:activeDrop>
			<button on:click={clear}>New</button>
			<button class="unavailable">Save</button>
		</DropDown>
		<DropDown name="Edit" bind:activeDrop>
			<button class="unavailable">Undo</button>
		</DropDown>
	</div>
	<div class="content">
		<textarea bind:value={textareaValue} />
	</div>
</div>

<style lang="scss">
	div.menu {
		display: flex;
		margin: 0 0.2rem;

		@include tab-border(white, $dark-grey);

		button:not(.unavailable) {
			@include dropdown-button;
		}

		button.unavailable {
			@include dropdown-button(false);
		}
	}

	div.content {
		margin-left: 0.2rem;
		margin-right: 0.2rem;
		textarea {
			min-height: 80px;
			min-width: 150px;
			padding-top: 0.2rem;
			padding-left: 0.2rem;
			font-size: 1.1rem;
			outline: none;
			height: 30rem;
			width: 50rem;
		}
	}
</style>
