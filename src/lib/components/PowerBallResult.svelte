<script lang="ts">
  import { lottoResults, isScraping, selectedLotto } from "$lib/stores/lottoStore";

  let results = $derived($lottoResults || []);
  
  let powerBallStats = $derived.by(() => {
    if ($selectedLotto.product !== 'Powerball' || results.length === 0) return [];

    const frequencyMap: Record<number, number> = {};
    results.forEach(draw => {
      // In Powerball, the SecondaryNumbers contains the Powerball number
      if (draw.Secondaries && draw.Secondaries.length > 0) {
        const pb = draw.Secondaries[0];
        frequencyMap[pb] = (frequencyMap[pb] || 0) + 1;
      }
    });

    return Object.entries(frequencyMap)
      .map(([num, count]) => ({
        Number: parseInt(num),
        Count: count,
        Percentage: (count / results.length) * 100
      }))
      .sort((a, b) => b.Count - a.Count)
      .slice(0, 10);
  });
</script>

{#if $selectedLotto.product === 'Powerball' && powerBallStats.length > 0}
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-bold text-gray-800">
        Powerball Number Frequency (Top 10)
      </h2>
      <span class="text-xs text-blue-500 font-medium bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 italic">
        Based on {results.length} draws
      </span>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-5 gap-4">
      {#each powerBallStats as pb}
        <div class="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center space-y-2 relative overflow-hidden group">
          <div class="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div 
            class="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-inner z-10"
            style="background-color: #1e3a8a; color: white;"
          >
            {pb.Number}
          </div>
          
          <div class="text-center z-10">
            <div class="text-blue-900 font-bold text-sm">{pb.Percentage.toFixed(1)}%</div>
            <div class="text-[10px] text-gray-400 uppercase tracking-tighter">{pb.Count} Times</div>
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}
