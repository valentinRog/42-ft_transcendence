<script lang="ts">
	export let tabIcon: string;
	export let name: string;
	export let active: boolean;
</script>

<div class="tab" on:click class:active>
	<img src={tabIcon} alt={name} />
	<a href="/">
		{name}
	</a>
</div>

<style lang="scss">
	.tab {
		@include tab;
		
		display: flex;
		flex-basis: 15rem;
		flex-shrink: 1;
		flex-wrap: nowrap;
		overflow: hidden;

		a {
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}
	}
</style>
