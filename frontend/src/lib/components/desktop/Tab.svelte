<script lang="ts">
	export let name: string;
	export let icon: string;
	export let active: boolean;
	export let props: Record<string, any>;
</script>

<div class="tab" on:click class:active>
	<img src={icon} alt={name} />
	<a href="/">
		{#if name === 'Profile' && props.username}
			<p>{name} of {props.username}</p>
		{:else if name === 'Profile'}
			<p>My {name}</p>
		{:else}
			<p>{name}</p>
		{/if}
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
