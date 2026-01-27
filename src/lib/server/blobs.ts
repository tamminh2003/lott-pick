import { getStore } from '@netlify/blobs';
import type { LottoResult } from '$lib/models/LottoResult';
import { env } from '$env/dynamic/private';
import fs from 'fs';
import path from 'path';

const STORE_NAME = 'lotto-results';
const LOCAL_CACHE_DIR = '.lotto-cache';

/**
 * Gets the blob store for lotto results.
 * Returns null if not in a Netlify environment.
 */
function getLottoStore() {
    try {
        return getStore(STORE_NAME);
    } catch (e) {
        return null;
    }
}

/**
 * Loads historical results for a specific product.
 * Falls back to local file system if Netlify Blobs are not available.
 */
export async function getCachedResults(product: string): Promise<LottoResult[]> {
    // 1. Try Netlify Blobs first
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
            console.warn(`Netlify Blobs not available for ${product}, checking local cache...`);
        }
    }

    // 2. Fallback to local file system (for local dev)
    const filePath = path.join(LOCAL_CACHE_DIR, `${product}.json`);
    if (fs.existsSync(filePath)) {
        try {
            const fileData = fs.readFileSync(filePath, 'utf-8');
            const data = JSON.parse(fileData);
            return data.map((draw: any) => ({
                ...draw,
                DrawDate: new Date(draw.DrawDate)
            }));
        } catch (e) {
            console.error(`Error reading local cache for ${product}:`, e);
        }
    }

    return [];
}

/**
 * Saves results to Netlify Blobs with local file backup.
 */
export async function saveResultsToCache(product: string, results: LottoResult[]): Promise<void> {
    const sortedResults = [...results].sort((a, b) => a.DrawDate.getTime() - b.DrawDate.getTime());

    // 1. Try to save to Netlify Blobs
    const store = getLottoStore();
    if (store) {
        try {
            await store.setJSON(product, sortedResults);
            console.log(`Saved ${results.length} draws to Netlify Blobs for ${product}.`);
        } catch (error) {
            console.warn(`Could not save to Netlify Blobs for ${product}. Environment might be local.`);
        }
    }

    // 2. Always save to local file system (useful for local dev and as backup)
    try {
        if (!fs.existsSync(LOCAL_CACHE_DIR)) {
            fs.mkdirSync(LOCAL_CACHE_DIR, { recursive: true });
        }
        const filePath = path.join(LOCAL_CACHE_DIR, `${product}.json`);
        fs.writeFileSync(filePath, JSON.stringify(sortedResults, null, 2));
        console.log(`Saved ${results.length} draws to local cache at ${filePath}.`);
    } catch (e) {
        console.error(`Error writing local cache for ${product}:`, e);
    }
}
