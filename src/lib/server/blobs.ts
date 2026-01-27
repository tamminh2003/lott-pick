import { getStore } from '@netlify/blobs';
import type { LottoResult } from '$lib/models/LottoResult';
import type { NextDrawProbability } from '$lib/models/NextDrawProbability';
import { env } from '$env/dynamic/private';

const STORE_NAME = 'lotto-results';
const ANALYSIS_STORE_NAME = 'analysis-results';

export interface AnalysisResult {
    Model: string;
    Product: string;
    Result: NextDrawProbability[];
    ResultDate: string;
}

/**
 * Gets the blob store for lotto results.
 * Returns null if not in a Netlify environment.
 */
function getLottoStore() {
    try {
        if (env.NETLIFY_SITE_ID && env.NETLIFY_AUTH_TOKEN) {
            console.log(`[Blobs] Initializing store '${STORE_NAME}' with Site ID and Token.`);
            return getStore({
                name: STORE_NAME,
                siteID: env.NETLIFY_SITE_ID,
                token: env.NETLIFY_AUTH_TOKEN
            });
        }
        console.log(`[Blobs] Initializing store '${STORE_NAME}' using default environment.`);
        return getStore(STORE_NAME);
    } catch (e) {
        console.error("[Blobs] Error initializing store:", e);
        return null;
    }
}

/**
 * Loads historical results for a specific product.
 */
export async function getCachedResults(product: string): Promise<LottoResult[]> {
    const store = getLottoStore();
    if (store) {
        try {
            console.log(`[Blobs] Fetching data for product: ${product}`);
            const data = await store.get(product, { type: 'json' }) as any[];
            if (data) {
                console.log(`[Blobs] Successfully retrieved ${data.length} records for ${product}.`);
                return data.map(draw => ({
                    ...draw,
                    DrawDate: new Date(draw.DrawDate)
                }));
            }
            console.log(`[Blobs] No data found in store for ${product}.`);
        } catch (error) {
            console.error(`[Blobs] Error fetching from Netlify Blobs for ${product}:`, error);
        }
    } else {
        console.warn("[Blobs] Netlify Blob store not available.");
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

/**
 * Gets the blob store for AI analysis results.
 */
function getAnalysisStore() {
    try {
        if (env.NETLIFY_SITE_ID && env.NETLIFY_AUTH_TOKEN) {
            return getStore({
                name: ANALYSIS_STORE_NAME,
                siteID: env.NETLIFY_SITE_ID,
                token: env.NETLIFY_AUTH_TOKEN
            });
        }
        return getStore(ANALYSIS_STORE_NAME);
    } catch (e) {
        console.error("[Blobs] Error initializing analysis store:", e);
        return null;
    }
}

/**
 * Loads cached AI analysis for a specific product.
 */
export async function getCachedAnalysis(product: string): Promise<AnalysisResult | null> {
    const store = getAnalysisStore();
    if (store) {
        try {
            console.log(`[Blobs] Fetching analysis for product: ${product}`);
            const data = await store.get(product, { type: 'json' }) as AnalysisResult;
            return data;
        } catch (error) {
            console.error(`[Blobs] Error fetching analysis from Netlify Blobs for ${product}:`, error);
        }
    }
    return null;
}

/**
 * Saves AI analysis result to Netlify Blobs.
 */
export async function saveAnalysisResult(analysis: AnalysisResult): Promise<void> {
    const store = getAnalysisStore();
    if (store) {
        try {
            await store.setJSON(analysis.Product, analysis);
            console.log(`[Blobs] Saved analysis result for ${analysis.Product} to Netlify Blobs.`);
        } catch (error) {
            console.error(`[Blobs] Error saving analysis to Netlify Blobs for ${analysis.Product}:`, error);
        }
    }
}
