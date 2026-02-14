<script lang="ts">
    import {
        frequencyDistribution,
        isAnalyzingFrequency,
        frequencyError,
        loadFrequencyDistribution,
        selectedLotto,
    } from "$lib/stores/lottoStore";

    // Sort data by Count (least appearance to most appearance)
    let sortedData = $derived(
        [...($frequencyDistribution?.distribution || [])].sort(
            (a, b) => a.Count - b.Count,
        ),
    );
    let totalDraws = $derived($frequencyDistribution?.totalDraws || 1);

    // Optimize maxCount and minCount calculation as derived values
    let maxCount = $derived(
        sortedData.length > 0 ? Math.max(...sortedData.map((d) => d.Count)) : 0,
    );
    let minCount = $derived(
        sortedData.length > 0 ? Math.min(...sortedData.map((d) => d.Count)) : 0,
    );

    let hoverData = $state<{ number: number; count: number } | null>(null);

    function getBarHeight(count: number): string {
        if (maxCount === 0) return "0%";
        const percentage = (count / maxCount) * 100;
        return `${count > 0 ? Math.max(percentage, 2) : 0}%`;
    }

    function getBarColor(count: number): string {
        if (maxCount === minCount) return "#6366f1"; // Default indigo if no variance

        // Ratio between 0 (coldest) and 1 (hottest)
        const ratio = (count - minCount) / (maxCount - minCount);

        // Interpolate between Blue/Cyan (210) and Orange/Red (15)
        const hue = 210 - (210 - 15) * ratio;
        const saturation = 70 + 20 * ratio; // Increase saturation for hotter colors
        const lightness = 65 - 10 * ratio; // Slightly darken hotter colors

        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }
</script>

<div class="space-y-4">
    <div class="flex items-center justify-between">
        <div class="flex flex-col">
            <h3 class="text-base sm:text-lg font-bold text-gray-800">
                Frequency Analysis ({$selectedLotto?.name})
            </h3>
            <p class="text-[10px] text-gray-400 font-medium">
                Sorted by appearance count (Least → Most)
            </p>
        </div>
        <button
            onclick={loadFrequencyDistribution}
            disabled={$isAnalyzingFrequency}
            class="flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-all border border-indigo-100 shadow-sm"
        >
            <svg
                class="w-4 h-4"
                class:animate-spin={$isAnalyzingFrequency}
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
            <span>{$isAnalyzingFrequency ? "Analyzing..." : "Refresh"}</span>
        </button>
    </div>

    {#if $isAnalyzingFrequency && sortedData.length === 0}
        <div
            class="h-48 bg-gray-50 animate-pulse rounded-lg border border-gray-100"
        ></div>
    {:else if $frequencyError}
        <div
            class="p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm"
        >
            {$frequencyError}
        </div>
    {:else if sortedData.length > 0}
        <div
            class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm overflow-hidden relative group"
        >
            <!-- Tooltip -->
            {#if hoverData}
                <div
                    class="absolute top-4 left-1/2 -translate-x-1/2 bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-lg shadow-xl z-20 pointer-events-none animate-in fade-in zoom-in duration-150"
                >
                    <div class="flex items-center gap-2">
                        <span
                            class="w-6 h-6 flex items-center justify-center rounded-full bg-white/10 text-white text-[10px] font-bold"
                        >
                            {hoverData.number}
                        </span>
                        <span class="text-xs text-white/90 font-medium">
                            {hoverData.count} appearances
                        </span>
                    </div>
                </div>
            {/if}

            <div class="h-40 flex items-end gap-1 sm:gap-1.5 pt-8">
                {#each sortedData as item}
                    <div
                        class="flex-1 h-full flex flex-col items-center justify-end group/bar cursor-pointer"
                        role="button"
                        tabindex="0"
                        onmouseenter={() =>
                            (hoverData = {
                                number: item.Number,
                                count: item.Count,
                            })}
                        onmouseleave={() => (hoverData = null)}
                    >
                        <!-- Bar Container (ensures height context) -->
                        <div class="w-full h-full flex flex-col justify-end">
                            <div
                                class="w-full relative rounded-t-sm transition-all duration-300 group-hover/bar:filter group-hover/bar:brightness-110 group-hover/bar:scale-x-110"
                                style="height: {getBarHeight(
                                    item.Count,
                                )}; background-color: {getBarColor(item.Count)}"
                            >
                                <!-- Hover Highlight overlay -->
                                <div
                                    class="absolute inset-0 bg-white/20 opacity-0 group-hover/bar:opacity-100 transition-opacity rounded-t-sm"
                                ></div>
                            </div>
                        </div>

                        <!-- Label -->
                        <span
                            class="text-[8px] sm:text-[9px] text-gray-400 font-bold mt-2"
                        >
                            {item.Number}
                        </span>
                    </div>
                {/each}
            </div>

            <!-- X-Axis Label -->
            <div class="flex justify-center mt-3 pt-3 border-t border-gray-50">
                <span
                    class="text-[10px] text-gray-400 font-bold uppercase tracking-widest"
                    >Appearance Count Distribution (Least → Most)</span
                >
            </div>
        </div>
    {:else}
        <div
            class="p-8 text-center bg-gray-50 rounded-lg border border-gray-100 text-gray-400 text-sm"
        >
            No distribution data available.
        </div>
    {/if}
</div>

<style>
    /* Smooth height transitions */
    .w-full {
        will-change: height;
    }
</style>
