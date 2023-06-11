<script>
	export let count = 1;
  </script>

  <span class="notification-badge">
	{#if count > 0}
	  {count}
	{/if}
  </span>

<style lang="scss">
  .notification-badge {
	position: absolute;
	top: 2.8rem;
	right: 2rem;
	background-color: red;
	color: white;
	border-radius: 50%;
	width: 1rem;
	height: 1rem;
	display: flex;
	justify-content: center;
    align-items: flex-end;
  }
</style>
