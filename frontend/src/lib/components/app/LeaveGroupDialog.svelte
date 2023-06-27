<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    export let currentChat: any = null

    const dispatch = createEventDispatcher();

	let dialog: HTMLDialogElement;

	$: if (dialog) dialog.showModal();

    const confirmLeave = () => {
        dispatch('confirm');
        dialog.close();
    }

    const closeDialog = () => {
        dispatch('close');
        dialog.close();
    }
</script>


<dialog bind:this={dialog} class="leave-group-dialog">

    <div class="top-bar">
        <div class="topbutton">
            <button on:click={() => closeDialog()}>
                <div class="border-inside">&nbspX&nbsp</div>
            </button>
        </div>
    </div>
    <div class="form-group">
        <p>Are you really want to leave group {currentChat?.name} ?</p>
        <div class="buttons" on:click|stopPropagation>
            <button on:click={confirmLeave}>Oui</button>
            <button on:click={closeDialog}>Non</button>
        </div>
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
		margin: 1rem;

        button {
            height: 1.5rem;
            width: 2rem;
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

    .buttons button {
        margin: 0.5rem 0.7rem 0 0.7rem;
    }
</style>