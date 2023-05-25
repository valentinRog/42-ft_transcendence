<script lang="ts">
	export let desktopName: string;
	export let tabName: string;
	export let tabIcon: string;
	export let active: boolean;
</script>

<div class="tab" on:click class:active>
	<img src={tabIcon} alt={tabName} />
	<a href="/">
		{tabName}
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
