<script lang="ts">
	export let count = 0;
  </script>

{#if count > 0}
  <div class="notification-badge">
	  <span class="count">{count}</span>
  </div>
{/if}

<style lang="scss">
	.notification-badge {
		position: absolute;
		background-color: rgb(213, 1, 1);
		color: white;
		border-radius: 100%;
		width: 1rem;
		height: 1rem;
		display: flex;
		justify-content: center;
		align-items: flex-end;
		//margin-top: -45px; -> right top corner
		margin-top: -15px;
		right: 2rem;
		font-size: 0.8rem;
  	}

	.count {
		position: relative;
		transform: translate(-0.05rem, -0.1rem);
	}

</style>
