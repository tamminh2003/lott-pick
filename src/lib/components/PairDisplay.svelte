<script lang="ts">
    import {
        pairAnalysis,
        isAnalyzingPairs,
        pairError,
        loadPairAnalysis,
        selectedLotto,
    } from "$lib/stores/lottoStore";

    let data = $derived($pairAnalysis?.pairs || []);
    let totalDraws = $derived($pairAnalysis?.totalDraws || 1);

    function formatPercentage(count: number): string {
        return ((count / totalDraws) * 100).toFixed(1) + "%";
    }
</script>

<div class="space-y-4">
    <div class="flex items-center justify-between">
        <h3 class="text-base sm:text-lg font-bold text-gray-800">
            Most Appearing Pairs ({$selectedLotto?.name})
        </h3>
        <button
            onclick={loadPairAnalysis}
            disabled={$isAnalyzingPairs}
            class="flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-all border border-blue-100 shadow-sm"
        >
            <svg
                class="w-4 h-4"
                class:animate-spin={$isAnalyzingPairs}
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
            <span>{$isAnalyzingPairs ? "Analyzing..." : "Refresh"}</span>
        </button>
    </div>

    {#if $isAnalyzingPairs && data.length === 0}
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {#each Array(4) as _}
                <div
                    class="h-24 bg-gray-50 animate-pulse rounded-lg border border-gray-100"
                ></div>
            {/each}
        </div>
    {:else if $pairError}
        <div
            class="p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm"
        >
            {$pairError}
        </div>
    {:else if data.length > 0}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {#each data as pair, i}
                <div
                    class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between group"
                >
                    <div class="flex flex-col gap-2">
                        <div class="flex gap-1.5">
                            {#each pair.Numbers as number}
                                <span
                                    class="w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold border-2 transition-transform group-hover:scale-110"
                                    style="border-color: {$selectedLotto.primaryColor}; color: {$selectedLotto.primaryColor}"
                                >
                                    {number}
                                </span>
                            {/each}
                        </div>
                    </div>
                    <div class="text-right">
                        <div
                            class="text-lg font-bold text-gray-800 leading-none"
                        >
                            {pair.Count}
                        </div>
                        <div class="text-[10px] text-gray-500 font-medium">
                            {formatPercentage(pair.Count)}
                        </div>
                        <div class="text-[9px] text-gray-300">of draws</div>
                    </div>
                </div>
            {/each}
        </div>
    {:else}
        <div
            class="p-8 text-center bg-gray-50 rounded-lg border border-gray-100 text-gray-400 text-sm"
        >
            No pair data available.
        </div>
    {/if}
</div>

<style>
    /* Optional: Custom styles if needed */
</style>
