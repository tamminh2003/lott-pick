<script lang="ts">
  import type { LottoResult } from "$lib/models/LottoResult";
  import { onMount } from "svelte";
  import {
    lottoResults,
    isScraping,
    scrapeError,
    loadLottoResults,
    selectedLotto,
  } from "$lib/stores/lottoStore";

  let data = $derived($lottoResults || []);
  let isCollapsed = $state(true);


  function formatDate(date: Date): string {
    if (!(date instanceof Date) || isNaN(date.getTime())) return "Invalid Date";
    return date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "-");
  }
</script>

<div class="flex items-center justify-between mb-4">
  <div class="flex items-center gap-4">
    <h2 class="text-lg font-bold text-gray-800">
      Historical Results ({$selectedLotto?.name})
    </h2>
    <span
      class="text-sm text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full"
      >{data.length} Draws</span
    >
    <button
      onclick={() => (isCollapsed = !isCollapsed)}
      class="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
    >
      <svg
        class="w-4 h-4 transition-transform duration-200"
        class:rotate-180={!isCollapsed}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
      {isCollapsed ? "Show Table" : "Hide Table"}
    </button>
  </div>

  <button
    onclick={loadLottoResults}
    disabled={$isScraping}
    class="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-all border border-red-100 shadow-sm"
  >
    <svg
      class="w-4 h-4"
      class:animate-spin={$isScraping}
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
    {$isScraping ? "Scraping..." : "Refresh Results"}
  </button>
</div>

{#if !isCollapsed}
  <div class="transition-all duration-300 ease-in-out">
    {#if $isScraping && data.length === 0}
      <div
        class="flex flex-col items-center justify-center p-12 space-y-4 bg-white border border-gray-200 rounded-sm"
      >
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"
        ></div>
        <p class="text-gray-600 font-medium">
          Scraping latest lottery results...
        </p>
      </div>
    {:else if $scrapeError}
      <div
        class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm mb-4"
      >
        <p class="font-bold">Error loading results</p>
        <p class="text-sm">{$scrapeError}</p>
        <button
          onclick={loadLottoResults}
          class="mt-2 text-sm bg-red-100 px-3 py-1 rounded-sm hover:bg-red-200 transition-colors"
        >
          Try Again
        </button>
      </div>
    {/if}

    <div
      class="w-full overflow-x-auto bg-white shadow-sm border border-gray-200 rounded-sm"
      class:opacity-50={$isScraping}
    >
      <table class="w-full text-left border-collapse min-w-200">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-200">
            <th
              class="px-6 py-4 font-semibold text-gray-600 text-sm uppercase tracking-wider"
              >Draw Number</th
            >
            <th
              class="px-6 py-4 font-semibold text-gray-600 text-sm uppercase tracking-wider"
              >Draw Date</th
            >
            <th
              class="px-6 py-4 font-semibold text-gray-600 text-sm uppercase tracking-wider"
              >Primary Numbers</th
            >
            <th
              class="px-6 py-4 font-semibold text-gray-600 text-sm uppercase tracking-wider"
              >Secondary Numbers</th
            >
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          {#each data as row}
            <tr class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-5 text-sm text-gray-800 font-medium"
                >{row.DrawNumber}</td
              >
              <td class="px-6 py-5 text-sm text-gray-700"
                >{formatDate(row.DrawDate)}</td
              >
              <td class="px-6 py-5">
                <div class="flex flex-wrap gap-2">
                  {#each row.Primaries as number}
                    <span
                      class="number-circle"
                      style="background-color: {$selectedLotto.primaryColor}; color: {$selectedLotto.primaryColor ===
                      '#eab308'
                        ? '#000'
                        : '#fff'}"
                    >
                      {number}
                    </span>
                  {/each}
                </div>
              </td>
              <td class="px-6 py-5">
                <div class="flex flex-wrap gap-2">
                  {#each row.Secondaries as number}
                    <span
                      class="number-circle"
                      style="background-color: {$selectedLotto.secondaryColor}; color: #fff"
                    >
                      {number}
                    </span>
                  {/each}
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
{/if}

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
