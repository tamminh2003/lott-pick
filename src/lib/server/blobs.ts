import { getStore } from '@netlify/blobs';
import type { LottoResult } from '$lib/models/LottoResult';

const STORE_NAME = 'lotto-results';

/**
 * Gets the blob store for lotto results.
 */
function getLottoStore() {
    return getStore(STORE_NAME);
}

/**
 * Loads historical results for a specific product from Netlify Blobs.
 */
export async function getCachedResults(product: string): Promise<LottoResult[]> {
    const store = getLottoStore();
    try {
        const data = await store.get(product, { type: 'json' }) as any[];
        if (!data) return [];

        return data.map(draw => ({
            ...draw,
            DrawDate: new Date(draw.DrawDate)
        }));
    } catch (error) {
        console.error(`Error reading from blob store for ${product}:`, error);
        return [];
    }
}

/**
 * Saves results to Netlify Blobs.
 */
export async function saveResultsToCache(product: string, results: LottoResult[]): Promise<void> {
    const store = getLottoStore();
    try {
        // Sort before saving to ensure consistency
        const sortedResults = [...results].sort((a, b) => a.DrawDate.getTime() - b.DrawDate.getTime());
        await store.setJSON(product, sortedResults);
    } catch (error) {
        console.error(`Error writing to blob store for ${product}:`, error);
    }
}
