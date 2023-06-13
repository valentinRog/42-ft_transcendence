<script lang="ts">
	export let showModal: boolean;
	let dialog: HTMLDialogElement;
	export let errorMessage: string | null;

	$: if (dialog && showModal) dialog.showModal();
</script>

<dialog bind:this={dialog} on:close>
	<div class="top-bar">
		<div class="buttons">
			<button on:click={() => dialog.close()}>
				<div class="border-inside">&nbspX&nbsp</div>
			</button>
		</div>
	</div>
	<div class="content">
		<div class="icon-and-paragraph">
			<div class="row-icon"><img src="/msg_warning.png" /></div>
			<p>{errorMessage}</p>
		</div>
	</div>
	<div on:click|stopPropagation>
		<button on:click={() => dialog.close()}>OK</button>
	</div>
</dialog>

<style lang="scss">
	dialog {
		@include tab-contour;
		padding: 0;
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background-color: $grey;
	}
	dialog::backdrop {
		background: rgba(0, 0, 0, 0.3);
	}

	.icon-and-paragraph {
		display: flex;
		align-items: center;
		gap: 0.7rem;
	}

	.row-icon img {
		width: 40px;
		height: 40px;
	}

	dialog > div > button {
		margin-bottom: 14px;
		margin-left: auto;
		margin-right: auto;
		display: block;
		padding: 0.3rem 2rem;
	}

	div.top-bar {
		background-color: $blue;
		height: 1.5rem;
		display: flex;
		align-items: center;

		.buttons {
			margin-left: auto;
			margin-right: 0.2rem;
		}
	}

	div.content {
		padding: 1rem;
		a {
			display: block;
			text-align: center;
		}
	}
</style>
