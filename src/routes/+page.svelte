<script lang="ts">
  import NextDrawTable from "$lib/components/NextDrawTable.svelte";
  import ResultTable from "$lib/components/ResultTable.svelte";

  import type { LottoResult } from "$lib/models/LottoResult";
  import type { NextDrawProbability } from "$lib/models/NextDrawProbability";
</script>

<div class="max-w-6xl mx-auto p-4 md:p-8 space-y-12">
  <div class="space-y-4">
    <ResultTable />
  </div>

  <div class="space-y-4">
    <NextDrawTable />
  </div>
</div>
