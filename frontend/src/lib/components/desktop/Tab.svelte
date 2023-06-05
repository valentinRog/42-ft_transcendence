<script lang="ts">
	export let name: string;
	export let icon: string;
	export let active: boolean;
	export let props: Record<string, any>;
</script>

<div class="tab" on:click class:active>
	<div class="border-inside">
		<img src={icon} alt={name} />
		<a href="/">
			{#if name === 'Profile' && props.username}
				<p>{name} of {props.username}</p>
			{:else if name === 'Profile'}
				<p>My {name}</p>
			{:else if name === 'Chat' && props.name && props.typeChat}
				<p>{props.typeChat} of {props.name}</p>
			{:else}
				<p>{name}</p>
			{/if}
		</a>
	</div>
</div>

<style lang="scss">
	.tab {
		@include tab;
	}
</style>
