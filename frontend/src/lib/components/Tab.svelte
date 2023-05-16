<script lang="ts">
	export let route: string;
	export let name: string;
    export let visible: boolean;

    function handleClickTab() {
        if (visible == true)
            visible = false;
        visible = true;
    }

</script>

<a href="/" on:click={handleClickTab}>
	<img src={route} alt="{name}" />
	{name}
</a>

<style lang="scss">
	@include tab;
</style>
