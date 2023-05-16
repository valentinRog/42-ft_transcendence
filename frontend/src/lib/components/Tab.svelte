<script lang="ts">
	export let route: string;
</script>

<a href="/">
	<img src={route} alt="chat" />
	Chat
</a>

<style lang="scss">
	@include tab;
</style>
