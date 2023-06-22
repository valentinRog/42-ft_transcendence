<script lang="ts">
	export let showDialog: boolean;
	let dialog: HTMLDialogElement;

	$: if (dialog && showDialog) dialog.show();
</script>

<dialog bind:this={dialog} on:close>
	<div class="top-bar">
		<div class="buttons">
			<button on:click={() => dialog.close()}>
				<div class="border-inside">&nbspX&nbsp</div>
			</button>
		</div>
	</div>
	<div class="form-group">
			<label for="twoFactor">Provide the two factor number : </label>
			<input type="text" id="twoFactor" name="twoFactor" />
	</div>
	<div on:click|stopPropagation>
		<button on:click={() => dialog.close()}>OK</button>
	</div>
</dialog>

<style lang="scss">

	.form-group {
		@include form-95;

		padding: 0.8em;


		margin-bottom: 0.5rem;
		background-color: $grey;

		display: flex;
		flex-direction: column;
		form {
			@include tab-border($light-grey, $dark-grey);
			gap: 0.8rem;
			padding: 1rem;
			margin-top: 0.2rem;
		}
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
		margin-bottom: 12px;
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
			display: flex;
			flex-direction: column;
		}
	}
</style>
