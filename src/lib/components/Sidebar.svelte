<script lang="ts">
    import {
        selectedLotto,
        LOTTO_TYPES,
        changeLottoType,
    } from "$lib/stores/lottoStore";

    let isCollapsed = $state(false);

    const toggleSidebar = () => (isCollapsed = !isCollapsed);
</script>

<aside
    class="fixed left-0 top-0 h-full bg-gray-900 text-white transition-all duration-300 z-50 flex flex-col shadow-2xl"
    class:w-64={!isCollapsed}
    class:w-16={isCollapsed}
>
    <!-- Header/Toggle -->
    <div class="p-4 flex items-center justify-between border-b border-gray-800">
        {#if !isCollapsed}
            <span class="font-bold text-xl tracking-tight text-blue-400"
                >LottPick</span
            >
        {/if}
        <button
            onclick={toggleSidebar}
            class="p-1 hover:bg-gray-800 rounded-md transition-colors"
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
    </div>

    <!-- Lotto Types -->
    <nav class="flex-1 overflow-y-auto py-6 px-2 space-y-2">
        {#each LOTTO_TYPES as lotto}
            <button
                onclick={() => changeLottoType(lotto)}
                class="w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group relative"
                class:bg-blue-600={$selectedLotto.name === lotto.name}
                class:hover:bg-gray-800={$selectedLotto.name !== lotto.name}
            >
                <div
                    class="w-2 h-2 rounded-full"
                    class:bg-white={$selectedLotto.name === lotto.name}
                    class:bg-blue-500={$selectedLotto.name !== lotto.name}
                ></div>

                {#if !isCollapsed}
                    <span class="font-medium">{lotto.name}</span>
                {/if}

                {#if isCollapsed}
                    <div
                        class="absolute left-full ml-4 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50"
                    >
                        {lotto.name}
                    </div>
                {/if}
            </button>
        {/each}
    </nav>

    <!-- Footer -->
    {#if !isCollapsed}
        <div class="p-4 text-[10px] text-gray-500 border-t border-gray-800">
            v0.2.0 • Multi-Support
        </div>
    {/if}
</aside>
