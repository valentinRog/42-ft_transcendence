<script lang="ts">
	import { Context } from '$lib/components/Context.svelte';
	import ErrorDialog from '$lib/components/ErrorDialog.svelte';
	import { token } from '$lib/stores';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	onMount(() => {
		if ($page.url.searchParams.get('token')) {
			$token = $page.url.searchParams.get('token');
			if (browser) sessionStorage.setItem('token', $token!);
			goto('/', { replaceState: true });
		}
	});

	let dialog: HTMLDialogElement;

	export let showDialog : boolean;
	let showModal = false;
	let errorMessage: string | null = null;

	const fetchWithToken = Context.fetchWithToken();

	$: if (dialog && showDialog) dialog.showModal();

	let numbers: string[] = [];
	let activeInput: HTMLInputElement;

	function addNumber(event: any) {
		activeInput = event.target;
		let inputValue = activeInput.value;
		const code = parseInt(inputValue);
		if (code >= 0 && code <= 9) {
			numbers.push(inputValue);
			activeInput = activeInput?.nextElementSibling as HTMLInputElement;;
			if (activeInput) activeInput.focus();
		}
		else
			activeInput.value = "";
		numbers = numbers;
	}

	function keydown(event: any) {
		if ( event.key === "Backspace" ) {
			numbers.pop();
			activeInput = activeInput?.previousElementSibling as HTMLInputElement;
			if (activeInput) activeInput.focus();
			return ;
		}
	}

	async function enable2fa(code : string) {
			const res = await fetchWithToken(`2fa/validate/${code}`, {
			method: 'POST'
		});
		const json = await res.json();
		if (res.status !== 200 && res.status !== 201) {
			errorMessage = json.message;
			showModal = true;
		}
		else {
			dialog.close();

			const res = await fetchWithToken('2fa/enable', {
				method: 'POST',
			});
			const data = await res.json();
			$token = data.token;
			sessionStorage.setItem('token', data.token);
		}
	}

	function handleOK () {
		if (numbers.length === 6) {
			const code = numbers.join("");
			enable2fa(code);
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
			<label for="twoFactor">Provide your two factor code : </label>
			<div id='inputs'>
				  <input id='input1' type='text' maxLength="1" on:input={addNumber} on:keydown={keydown}/>
				  <input id='input2' type='text' maxLength="1" on:input={addNumber} on:keydown={keydown}/>
				  <input id='input3' type='text' maxLength="1" on:input={addNumber} on:keydown={keydown}/>
				  <input id='input4' type='text' maxLength="1" on:input={addNumber} on:keydown={keydown}/>
				  <input id='input5' type='text' maxLength="1" on:input={addNumber} on:keydown={keydown}/>
				  <input id='input6' type='text' maxLength="1" on:input={addNumber} on:keydown={keydown}/>
			</div>

	</div>
	<div class="buttons" on:click|stopPropagation>
		<button on:click={handleOK}>OK</button>
		<button on:click={() => dialog.close()}>Cancel</button>
	</div>
</dialog>

<style lang="scss">
	.form-group {

		label {
			font-size: 1.1rem;
			margin-bottom: 0.5rem;
		}

		input {
			font-size: 1.1rem;
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
