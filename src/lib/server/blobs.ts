import { getStore } from '@netlify/blobs';
import type { LottoResult } from '$lib/models/LottoResult';
import { env } from '$env/dynamic/private';

const STORE_NAME = 'lotto-results';

/**
 * Gets the blob store for lotto results.
 * Returns null if not in a Netlify environment.
 */
function getLottoStore() {
    try {
        console.log("DEBUG");
        if (env.NETLIFY_SITE_ID && env.NETLIFY_AUTH_TOKEN) {
            let temp = getStore({
                name: STORE_NAME,
                siteID: env.NETLIFY_SITE_ID,
                token: env.NETLIFY_AUTH_TOKEN
            });
            if (!temp) console.log("Store Not Found");
            return temp;
        }
        let temp = getStore(STORE_NAME);
        if (!temp) console.log("Store Not Found");
        return temp;
    } catch (e) {
        return null;
    }
}

/**
 * Loads historical results for a specific product.
 */
export async function getCachedResults(product: string): Promise<LottoResult[]> {
    // Try Netlify Blobs
    const store = getLottoStore();
    if (store) {
        try {
            const data = await store.get(product, { type: 'json' }) as any[];
            if (data) {
                return data.map(draw => ({
                    ...draw,
                    DrawDate: new Date(draw.DrawDate)
                }));
            }
        } catch (error) {
            console.warn(`Netlify Blobs not available for ${product}`);
        }
    }

    return [];
}

/**
 * Saves results to Netlify Blobs.
 */
export async function saveResultsToCache(product: string, results: LottoResult[]): Promise<void> {
    const sortedResults = [...results].sort((a, b) => a.DrawDate.getTime() - b.DrawDate.getTime());

    // Try to save to Netlify Blobs
    const store = getLottoStore();
    if (store) {
        try {
            await store.setJSON(product, sortedResults);
            console.log(`Saved ${results.length} draws to Netlify Blobs for ${product}.`);
        } catch (error) {
            console.warn(`Could not save to Netlify Blobs for ${product}. Environment might be local.`);
        }
    }
}
