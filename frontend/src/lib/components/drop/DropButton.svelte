<script lang="ts">
</script>

<button on:click>
	<slot />
</button>

<style lang="scss">
	button {
		@include dropdown-button;
		text-align: left;
		width: 100%;
	}
</style>
