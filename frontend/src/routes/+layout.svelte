<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import 'bootstrap/dist/css/bootstrap.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}

<style>
	:global(body) {
        background: #121212;
        color: #fff;
        margin: 0;
    }
</style>
