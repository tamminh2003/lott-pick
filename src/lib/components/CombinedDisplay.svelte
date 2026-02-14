<script lang="ts">
    import {
        combinedAnalysis,
        isAnalyzingCombined,
        combinedError,
        loadCombinedAnalysis,
        selectedLotto,
    } from "$lib/stores/lottoStore";

    let data = $derived($combinedAnalysis?.rankings || []);
    let totalDraws = $derived($combinedAnalysis?.totalDraws || 1);

    function getStrength(tier: number, totalScore: number): string {
        if (tier === 1) return "Triple Synchronicity";
        if (tier === 2) return "Quad-Tri Matrix";
        if (tier === 3) return "Quad-Pair Link";
        if (tier === 4) return "Tri-Pair Link";
        return "Noteworthy";
    }

    function getStrengthColor(tier: number): string {
        if (tier === 1)
            return "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200";
        if (tier === 2) return "bg-blue-100 text-blue-700 border-blue-200";
        if (tier === 3)
            return "bg-emerald-100 text-emerald-700 border-emerald-200";
        if (tier === 4) return "bg-amber-100 text-amber-700 border-amber-200";
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
</script>

<div class="space-y-4">
    <div class="flex items-center justify-between">
        <div class="flex flex-col">
            <h3 class="text-base sm:text-lg font-bold text-gray-800">
                Pattern Synchronicity ({$selectedLotto?.name})
            </h3>
            <p class="text-[10px] text-gray-400 font-medium">
                Matching Top 21 Pairs, Triplets & Quadruplets
            </p>
        </div>
        <button
            onclick={loadCombinedAnalysis}
            disabled={$isAnalyzingCombined}
            class="flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-all border border-blue-100 shadow-sm"
        >
            <svg
                class="w-4 h-4"
                class:animate-spin={$isAnalyzingCombined}
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
            <span>{$isAnalyzingCombined ? "Calculating..." : "Refresh"}</span>
        </button>
    </div>

    {#if $isAnalyzingCombined && data.length === 0}
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {#each Array(4) as _}
                <div
                    class="h-32 bg-gray-50 animate-pulse rounded-lg border border-gray-100"
                ></div>
            {/each}
        </div>
    {:else if $combinedError}
        <div
            class="p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm"
        >
            {$combinedError}
        </div>
    {:else if data.length > 0}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {#each data as match}
                <div
                    class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col gap-3 group relative overflow-hidden"
                >
                    <!-- Strength Badge -->
                    <div class="absolute top-0 right-0 p-2">
                        <span
                            class={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded-bl-lg shadow-sm ${getStrengthColor(match.Tier)}`}
                        >
                            {getStrength(match.Tier, match.TotalScore)}
                        </span>
                    </div>

                    <!-- Numbers -->
                    <div class="flex gap-1.5">
                        {#each match.Numbers as number}
                            <span
                                class="w-9 h-9 flex items-center justify-center rounded-full text-xs font-bold border-2 transition-all group-hover:scale-110 shadow-sm"
                                style="border-color: {$selectedLotto.primaryColor}; color: {$selectedLotto.primaryColor}; background-color: white"
                            >
                                {number}
                            </span>
                        {/each}
                    </div>

                    <!-- Rank Breakdown -->
                    <div class="flex flex-wrap gap-2 mt-auto">
                        {#if match.PairRank}
                            <div class="flex flex-col">
                                <span
                                    class="text-[9px] text-gray-400 uppercase font-bold"
                                    >Pair</span
                                >
                                <span
                                    class="text-xs font-semibold text-gray-700"
                                    >Rank #{match.PairRank}</span
                                >
                            </div>
                        {/if}
                        {#if match.TripletRank}
                            <div
                                class="flex flex-col border-l border-gray-100 pl-2"
                            >
                                <span
                                    class="text-[9px] text-gray-400 uppercase font-bold"
                                    >Triplet</span
                                >
                                <span
                                    class="text-xs font-semibold text-gray-700"
                                    >Rank #{match.TripletRank}</span
                                >
                            </div>
                        {/if}
                        {#if match.QuadRank}
                            <div
                                class="flex flex-col border-l border-gray-100 pl-2"
                            >
                                <span
                                    class="text-[9px] text-gray-400 uppercase font-bold"
                                    >Quad</span
                                >
                                <span
                                    class="text-xs font-semibold text-gray-700"
                                    >Rank #{match.QuadRank}</span
                                >
                            </div>
                        {/if}
                    </div>

                    <!-- Footer -->
                    <div
                        class="flex items-center justify-between pt-2 border-t border-gray-50 mt-1"
                    >
                        <div class="flex flex-col">
                            <span class="text-[10px] text-gray-400"
                                >Scaled Index</span
                            >
                            <span class="text-sm font-bold text-gray-900"
                                >{match.AdjustedScore.toFixed(1)}</span
                            >
                        </div>
                        <div class="text-[9px] text-gray-300 font-medium">
                            Lower is Better
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {:else}
        <div
            class="p-12 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 text-sm"
        >
            No multidimensional pattern matches found in current top results.
        </div>
    {/if}
</div>

<style>
    /* Add any specific styles here */
</style>
