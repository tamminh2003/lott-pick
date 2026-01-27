<script lang="ts">
	import "./layout.css";
	import favicon from "$lib/assets/favicon.svg";
	import Sidebar from "$lib/components/Sidebar.svelte";

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>LottPick - Intelligent Lottery Analysis</title>
</svelte:head>

<div class="flex min-h-screen bg-gray-50">
	<Sidebar />
	<main class="flex-1 ml-16 md:ml-16 transition-all duration-300">
		<div class="p-4 md:p-8 max-w-7xl mx-auto">
			{@render children()}
		</div>
	</main>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		overflow-x: hidden;
	}
</style>
