<script lang="ts">
  import { onMount } from "svelte";
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

<div
  class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 relative"
>
  <div class="flex flex-col">
    <h2 class="text-base sm:text-lg font-bold text-gray-800">
      Next Draw Predictions ({$selectedLotto?.name})
    </h2>
    <div class="relative inline-block">
      <button
        onclick={() => (showMethodInfo = !showMethodInfo)}
        class="text-[10px] sm:text-xs text-blue-500 font-medium opacity-80 hover:opacity-100 flex items-center gap-1 cursor-help transition-opacity"
      >
        Method: {$isPredicting
          ? "Calculating..."
          : data.length > 0
            ? "Empirical Pattern Analysis"
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
            <h4 class="font-bold text-gray-800">About Empirical Analysis</h4>
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
            Our dual-model approach uses <strong>Gemini AI</strong> to identify
            complex nonlinear patterns, and <strong>Frequency Analysis</strong> as
            a fallback to track historical trends. It calculates the statistical
            "heat" of numbers over time to find clusters with the highest mathematical
            probability of appearing next.
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
    class="flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-all border border-blue-100 shadow-sm"
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
    <span>{$isPredicting ? "Analyzing..." : "Refresh Prediction"}</span>
  </button>
</div>

{#if $isPredicting && data.length === 0}
  <div
    class="flex flex-col items-center justify-center p-8 space-y-3 bg-gray-50 border border-gray-200 rounded-sm"
  >
    <div class="animate-pulse flex space-x-2">
      <div class="h-3 w-3 bg-blue-500 rounded-full"></div>
      <div class="h-3 w-3 bg-blue-500 rounded-full"></div>
      <div class="h-3 w-3 bg-blue-500 rounded-full"></div>
    </div>
    <p class="text-blue-600 text-xs sm:text-sm font-medium">
      Gemini AI is analyzing empirical patterns...
    </p>
  </div>
{:else if $predictError}
  <div
    class="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-sm mb-4"
  >
    <p class="font-bold text-sm">Prediction Error</p>
    <p class="text-xs">{$predictError}</p>
    <button
      onclick={loadPredictions}
      class="mt-2 text-xs bg-blue-100 px-3 py-1 rounded-sm hover:bg-blue-200 transition-colors underline"
    >
      Retry Prediction
    </button>
  </div>
{/if}

<div
  class="w-full overflow-x-auto bg-white shadow-sm border border-gray-200 rounded-sm"
  class:opacity-50={$isPredicting}
>
  <table class="w-full text-left border-collapse min-w-[300px]">
    <thead>
      <tr class="bg-gray-50 border-b border-gray-200">
        <th
          class="px-4 sm:px-6 py-3 sm:py-4 font-semibold text-gray-600 text-xs sm:text-sm uppercase tracking-wider"
          >Number</th
        >
        <th
          class="px-4 sm:px-6 py-3 sm:py-4 font-semibold text-gray-600 text-xs sm:text-sm uppercase tracking-wider"
          >Probability</th
        >
      </tr>
    </thead>
    <tbody class="divide-y divide-gray-100">
      {#each data as row}
        <tr class="hover:bg-gray-50 transition-colors">
          <td
            class="px-4 sm:px-6 py-4 sm:py-5 text-sm text-gray-800 font-medium"
          >
            <span
              class="number-circle"
              style="background-color: {$selectedLotto.primaryColor}; color: {$selectedLotto.primaryColor ===
              '#eab308'
                ? '#000'
                : '#fff'}"
            >
              {row.Number}
            </span>
          </td>
          <td class="px-4 sm:px-6 py-4 sm:py-5 text-sm text-gray-700"
            >{formatProbability(row.Probability)}</td
          >
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  table {
    font-feature-settings:
      "tnum" on,
      "lnum" on;
  }
  .number-circle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem; /* 36px */
    height: 2.25rem; /* 36px */
    border-radius: 9999px; /* full circle */
    font-weight: 600;
    font-size: 0.875rem; /* 14px */
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
</style>
