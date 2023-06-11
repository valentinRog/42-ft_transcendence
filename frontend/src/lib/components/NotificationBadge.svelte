<script>
	export let count = 1;
  </script>

  <span class="notification-badge">
	{#if count > 0}
		<span class="count">{count}</span>
	{/if}
  </span>

<style lang="scss">
	.notification-badge {
		position: relative;
		background-color: red;
		color: white;
		border-radius: 100%;
		width: 1rem;
		height: 1rem;
		display: flex;
		justify-content: center;
		align-items: flex-end;
		bottom: 0.8rem;
		left: 1rem;
		font-size: 0.8rem; /* Decrease the font size to make the count smaller */
  	}

	.count {
		position: relative;
		transform: translate(-0.05rem, -0.1rem); /* Adjust the translation values as needed */
	}
</style>
