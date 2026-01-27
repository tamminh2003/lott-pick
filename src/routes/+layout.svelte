<script lang="ts">
	import "./layout.css";
	import favicon from "$lib/assets/favicon.svg";
	import Sidebar from "$lib/components/Sidebar.svelte";

	let { children } = $props();
	let isMobileOpen = $state(false);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>LottPick - Intelligent Lottery Analysis</title>
</svelte:head>

<div class="flex min-h-screen bg-gray-50">
	<Sidebar bind:isMobileOpen />

	<div class="flex-1 flex flex-col min-w-0">
		<!-- Mobile Header -->
		<header
			class="md:hidden bg-blue-900 text-white p-4 flex items-center justify-between sticky top-0 z-40 shadow-md"
		>
			<span class="font-bold text-xl tracking-tight text-blue-300"
				>LottPick</span
			>
			<button
				onclick={() => (isMobileOpen = true)}
				class="p-1 hover:bg-blue-800 rounded-md transition-colors"
				aria-label="Open Sidebar"
			>
				<svg
					class="w-6 h-6"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h16m-7 6h7"
					/>
				</svg>
			</button>
		</header>

		<main class="flex-1 md:ml-16 transition-all duration-300">
			<div class="p-4 md:p-8 max-w-7xl mx-auto">
				{@render children()}
			</div>
		</main>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		overflow-x: hidden;
	}
</style>
