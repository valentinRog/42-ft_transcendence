<script lang="ts">
</script>

<button on:click>
	<slot />
</button>

<style lang="scss">
	button {
		@include dropdown-button;
		width: 100%;
	}
</style>
