<script lang="ts">
	export let icon: string;
	export let name: string;
	export let active: boolean;
</script>

<div class="tab" on:click class:active>
	<img src={icon} alt={name} />
	<a href="/">
		{name}
	</a>
</div>

<style lang="scss">
	.tab {
		// @include tab;
		
		@include tab-contour;
		@include tab-contour-active;
		img {
			@include tab-logo;
		}
		
		background-color: $grey;
		height: $tab-height;
		display: flex;
		padding: 0.2rem 0.8rem;
		margin-right: 0.25rem;
		flex-basis: 15rem;
		flex-shrink: 1;
		flex-wrap: nowrap;
		overflow: hidden;

		a {
			font-size: 1.2rem;
			text-decoration: none;
			color: inherit;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}
	}
</style>
