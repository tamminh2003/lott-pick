<script lang="ts">
    import {
        coldNumbersAnalysis,
        isAnalyzingCold,
        coldError,
        loadColdNumbersAnalysis,
        selectedLotto,
    } from "$lib/stores/lottoStore";

    let data = $derived($coldNumbersAnalysis?.coldNumbers || []);

    function formatProbability(prob: number): string {
        return (prob * 100).toFixed(1) + "%";
    }
</script>

<div class="space-y-4">
    <div class="flex items-center justify-between">
        <div class="flex flex-col">
            <h3 class="text-base sm:text-lg font-bold text-gray-800">
                Cold Numbers ({$selectedLotto?.name})
            </h3>
            <p class="text-[10px] text-gray-400 font-medium">
                Numbers with the least historical appearance
            </p>
        </div>
        <button
            onclick={loadColdNumbersAnalysis}
            disabled={$isAnalyzingCold}
            class="flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium text-cyan-600 bg-cyan-50 hover:bg-cyan-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-all border border-cyan-100 shadow-sm"
        >
            <svg
                class="w-4 h-4"
                class:animate-spin={$isAnalyzingCold}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
            </svg>
            <span>{$isAnalyzingCold ? "Analyzing..." : "Refresh"}</span>
        </button>
    </div>

    {#if $isAnalyzingCold && data.length === 0}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {#each Array(3) as _}
                <div
                    class="h-24 bg-gray-50 animate-pulse rounded-lg border border-gray-100"
                ></div>
            {/each}
        </div>
    {:else if $coldError}
        <div
            class="p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm"
        >
            {$coldError}
        </div>
    {:else if data.length > 0}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {#each data as row}
                <div
                    class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between group overflow-hidden relative"
                >
                    <!-- Cold Ice Effect -->
                    <div
                        class="absolute inset-0 bg-gradient-to-br from-cyan-50/20 to-transparent pointer-events-none"
                    ></div>

                    <div class="flex items-center gap-3 relative z-10">
                        <span
                            class="w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold border-2 transition-transform group-hover:scale-110 shadow-sm"
                            style="border-color: #06b6d4; color: #0891b2; background-color: #ecfeff"
                        >
                            {row.Number}
                        </span>
                        <div class="flex flex-col">
                            <span
                                class="text-[10px] text-gray-400 uppercase font-bold tracking-tight"
                                >Freq. Probability</span
                            >
                            <span class="text-sm font-bold text-gray-700"
                                >{formatProbability(row.Probability)}</span
                            >
                        </div>
                    </div>

                    <div
                        class="text-cyan-200 group-hover:text-cyan-400 transition-colors"
                    >
                        <svg
                            class="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                d="M12,2L14.43,8.35L21.2,5.27L18.12,12.04L24.47,14.47L17.7,17.55L20.78,24.32L14.41,21.24L11.97,27.59L9.54,21.24L3.17,24.32L6.25,17.55L-0.52,14.47L5.83,12.04L2.75,5.27L9.52,8.35L11.95,2L12,2Z"
                                transform="scale(0.8) translate(3,3)"
                            />
                        </svg>
                    </div>
                </div>
            {/each}
        </div>
    {:else}
        <div
            class="p-8 text-center bg-gray-50 rounded-lg border border-gray-100 text-gray-400 text-sm"
        >
            No cold number data available.
        </div>
    {/if}
</div>

<style>
    /* Optional: Custom styles if needed */
</style>
