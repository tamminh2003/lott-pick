<script lang="ts">
  import {
    predictions,
    isPredicting,
    predictError,
    loadPredictions,
    selectedLotto,
  } from "$lib/stores/lottoStore";

  let data = $derived($predictions || []);

  let showMethodInfo = $state(false);

  function formatProbability(prob: number): string {
    return (prob * 100).toFixed(1) + "%";
  }
</script>

<div class="space-y-4">
  <div
    class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative"
  >
    <div class="flex flex-col">
      <h2 class="text-base sm:text-lg font-bold text-gray-800">
        Hot Numbers ({$selectedLotto?.name})
      </h2>
      <div class="relative inline-block">
        <button
          onclick={() => (showMethodInfo = !showMethodInfo)}
          class="text-[10px] sm:text-xs text-orange-500 font-medium opacity-80 hover:opacity-100 flex items-center gap-1 cursor-help transition-opacity"
        >
          Method: {$isPredicting
            ? "Calculating..."
            : data.length > 0
              ? "Empirical Frequency Analysis"
              : "None"}
          <svg
            class="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>

        {#if showMethodInfo}
          <div
            class="absolute left-0 top-6 z-50 w-64 p-4 bg-white border border-gray-200 rounded-lg shadow-xl text-xs text-gray-600 animate-in fade-in slide-in-from-top-1 duration-200"
          >
            <div class="flex justify-between items-start mb-2">
              <h4 class="font-bold text-gray-800">About Frequency Analysis</h4>
              <button
                title="Close info"
                onclick={() => (showMethodInfo = false)}
                class="text-gray-400 hover:text-gray-600"
              >
                <svg
                  class="w-3 h-3"
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
            <p class="leading-relaxed">
              Our approach uses <strong>Frequency Analysis</strong> to track historical
              trends. It calculates the statistical "heat" of numbers over time to
              find clusters with the highest mathematical probability of appearing
              next.
            </p>
            <div
              class="mt-2 pt-2 border-t border-gray-50 text-[10px] text-gray-400 italic"
            >
              Note: Lottery selection is random; this is for demonstration only.
            </div>
          </div>
        {/if}
      </div>
    </div>
    <button
      onclick={loadPredictions}
      disabled={$isPredicting}
      class="flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-all border border-orange-100 shadow-sm"
    >
      <svg
        class="w-4 h-4"
        class:animate-spin={$isPredicting}
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
      <span>{$isPredicting ? "Analyzing..." : "Refresh"}</span>
    </button>
  </div>

  {#if $isPredicting && data.length === 0}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {#each Array(4) as _}
        <div
          class="h-24 bg-gray-50 animate-pulse rounded-lg border border-gray-100"
        ></div>
      {/each}
    </div>
  {:else if $predictError}
    <div
      class="p-4 bg-orange-50 border border-orange-100 rounded-lg text-orange-600 text-sm"
    >
      <p class="font-bold">Analysis Error</p>
      <p>{$predictError}</p>
    </div>
  {:else if data.length > 0}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {#each data as row}
        <div
          class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between group overflow-hidden relative"
        >
          <!-- Heat Fire Effect -->
          <div
            class="absolute inset-0 bg-gradient-to-br from-orange-50/20 to-transparent pointer-events-none"
          ></div>

          <div class="flex items-center gap-3 relative z-10">
            <span
              class="w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold border-2 transition-transform group-hover:scale-110 shadow-sm"
              style="border-color: #f97316; color: #ea580c; background-color: #fff7ed"
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
            class="text-orange-200 group-hover:text-orange-400 transition-colors"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M12,2C12,2 8,6.5 8,9.5C8,11.71 9.79,13.5 12,13.5C14.21,13.5 16,11.71 16,9.5C16,6.5 12,2 12,2ZM12,11.5C10.9,11.5 10,10.6 10,9.5C10,8.4 10.9,7.5 12,7.5C13.1,7.5 14,8.4 14,9.5C14,10.6 13.1,11.5 12,11.5ZM12,22C16.42,22 20,18.42 20,14C20,12.5 19.5,11.1 18.7,9.9L12,1L5.3,9.9C4.5,11.1 4,12.5 4,14C4,18.42 7.58,22 12,22Z"
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
      No data available.
    </div>
  {/if}
</div>

<style>
  /* Optional: Custom styles if needed */
</style>
