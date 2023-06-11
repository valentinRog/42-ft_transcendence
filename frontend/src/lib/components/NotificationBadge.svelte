<script>
	export let count = 1;
  </script>

  <div class="notification-badge">
	{#if count > 0}
		<span class="count">{count}</span>
	{/if}
  </div>

<style lang="scss">
	.notification-badge {
		position: absolute;
		background-color: red;
		color: white;
		border-radius: 100%;
		width: 1rem;
		height: 1rem;
		display: flex;
		justify-content: center;
		align-items: flex-end;
		margin-top: -12px;
		right: 2rem;
		font-size: 0.8rem;
  	}

	.count {
		position: relative;
		transform: translate(-0.05rem, -0.1rem);
	}

</style>
