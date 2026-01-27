<script lang="ts">
    import {
        selectedLotto,
        LOTTO_TYPES,
        changeLottoType,
    } from "$lib/stores/lottoStore";

    let { isMobileOpen = $bindable(false) } = $props();
    let isCollapsed = $state(false);

    const toggleSidebar = () => (isCollapsed = !isCollapsed);
    const closeMobile = () => (isMobileOpen = false);

    function handleLottoChange(lotto: any) {
        changeLottoType(lotto);
        if (window.innerWidth < 768) {
            closeMobile();
        }
    }
</script>

<!-- Backdrop for mobile -->
{#if isMobileOpen}
    <button
        onclick={closeMobile}
        class="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
        aria-label="Close Sidebar"
    ></button>
{/if}

<aside
    class="fixed left-0 top-0 h-full bg-blue-900 text-white transition-all duration-300 z-50 flex flex-col shadow-2xl
    {isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}"
    class:w-64={!isCollapsed}
    class:w-16={isCollapsed}
>
    <!-- Header/Toggle -->
    <div class="p-4 flex items-center justify-between border-b border-blue-800">
        {#if !isCollapsed}
            <span class="font-bold text-xl tracking-tight text-blue-300"
                >LottPick</span
            >
        {/if}
        <button
            onclick={toggleSidebar}
            class="hidden md:block p-1 hover:bg-blue-800 rounded-md transition-colors"
            aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
            <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                {#if isCollapsed}
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 5l7 7-7 7M5 5l7 7-7 7"
                    />
                {:else}
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                    />
                {/if}
            </svg>
        </button>
        <!-- Mobile close button -->
        <button
            onclick={closeMobile}
            class="md:hidden p-1 hover:bg-blue-800 rounded-md transition-colors"
            aria-label="Close Sidebar"
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
                    d="M6 18L18 6M6 6l12 12"
                />
            </svg>
        </button>
    </div>

    <!-- Lotto Types -->
    <nav class="flex-1 overflow-y-auto py-6 px-2 space-y-2">
        {#each LOTTO_TYPES as lotto}
            <button
                onclick={() => handleLottoChange(lotto)}
                class="w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group relative"
                class:bg-blue-600={$selectedLotto.name === lotto.name}
                class:hover:bg-blue-800={$selectedLotto.name !== lotto.name}
            >
                <img
                    src={lotto.icon}
                    alt={lotto.name}
                    class="w-6 h-6 rounded-sm object-cover object-left transition-all duration-300"
                    class:ring-2={$selectedLotto.name === lotto.name}
                    class:ring-white={$selectedLotto.name === lotto.name}
                    class:grayscale={$selectedLotto.name !== lotto.name}
                    class:group-hover:grayscale-0={$selectedLotto.name !==
                        lotto.name}
                />

                {#if !isCollapsed}
                    <span class="font-medium text-left">{lotto.name}</span>
                {/if}

                {#if isCollapsed}
                    <div
                        class="absolute left-full ml-4 px-2 py-1 bg-blue-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50"
                    >
                        {lotto.name}
                    </div>
                {/if}
            </button>
        {/each}
    </nav>

    <!-- Footer -->
    {#if !isCollapsed}
        <div class="p-4 text-[10px] text-blue-300 border-t border-blue-800">
            v0.2.0 • Multi-Support
        </div>
    {/if}
</aside>
