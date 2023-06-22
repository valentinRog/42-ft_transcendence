<script lang="ts">
	export let showDialog: boolean;
	let dialog: HTMLDialogElement;

	$: if (dialog && showDialog) dialog.showModal();

	let numbers: number[] = [];
	let activeInput: HTMLInputElement;

	function addNumber(event: any) {
		activeInput = event.target;
		let inputValue = activeInput.value;
		const code = parseInt(inputValue);
		console.log(code);
		if (code >= 0 && code <= 9) {
			numbers.push(code);
			activeInput = activeInput?.nextElementSibling as HTMLInputElement;;
			if (activeInput) activeInput.focus();
		}
		else
		{
			inputValue = "";
			activeInput.value = inputValue;
		}
		numbers = numbers;

		//if ( event.key === "Backspace" ) {
		//	activeInput?.previousElementSibling as HTMLInputElement;
		//	if (activeInput) activeInput.focus();
		//}
	}

	function addListener(event: any) {
		const input = event.target.value;
		console.log(input);
		const code = parseInt(input);
		if (code >= 0 && code <= 9) {
			const n = input.nextElementSibling;
		if (n) n.focus();
		} else {
			input.value = "";
		}

		const key = event.key;
		if (key === "Backspace" || key === "Delete") {
			console.log("backspace");
			const prev = input.previousElementSibling;
			if (prev) prev.focus();
		}
	}

	//function onKeyDown(e : KeyboardEvent) {
	//	console.log(e.key);
	//	if ( e.key === "Backspace" ) {
	//		activeInput?.previousElementSibling as HTMLInputElement;
	//		if (activeInput) activeInput.focus();
	//	}
	//	e.stopPropagation();
    //  	return;
	//}

	//(async () => {
	//	window.addEventListener("keydown", handleKeyDown);

	//	return () => {
	//	window.removeEventListener("keydown", handleKeyDown);
	//	};
	//});

</script>

<dialog bind:this={dialog} on:close>
	<div class="top-bar">
		<div class="topbutton">
			<button on:click={() => dialog.close()}>
				<div class="border-inside">&nbspX&nbsp</div>
			</button>
		</div>
	</div>
	<div class="form-group">
			<label for="twoFactor">Provide your two factor code : </label>
			<div id='inputs'>
				  <input id='input1' type='text' maxLength="1" on:input={addNumber}/>
				  <input id='input2' type='text' maxLength="1" on:input={addNumber}/>
				  <input id='input3' type='text' maxLength="1" on:input={addNumber}/>
				  <input id='input4' type='text' maxLength="1" on:input={addNumber}/>
				  <input id='input5' type='text' maxLength="1" on:input={addNumber}/>
				  <input id='input6' type='text' maxLength="1" on:input={addNumber}/>
			</div>

	</div>
	<div class="buttons" on:click|stopPropagation>
		<button on:click={() => dialog.close()}>OK</button>
		<button on:click={() => dialog.close()}>Cancel</button>
	</div>
</dialog>

<!--<svelte:window on:keydown|preventDefault={onKeyDown} />-->

<style lang="scss">
	.form-group {

		label {
			font-size: 1.1rem;
			margin-bottom: 0.5rem;
		}

		input {
			width: 2rem;
			height: 2rem;
			text-align: center;
			border:none;
			border-bottom: 1.5px solid #d2d2d2;
			margin: 0 2px;
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
		margin-bottom: 12px;
		margin-left: 0.6rem;
		margin-right: 0.6rem;
		width: 5rem;

		padding: 0.3rem
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
