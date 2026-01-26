import { writable } from 'svelte/store';
import type { LottoResult } from '$lib/models/LottoResult';
import type { NextDrawProbability } from '$lib/models/NextDrawProbability';

export const lottoResults = writable<LottoResult[] | null>(null);
export const predictions = writable<NextDrawProbability[] | null>(null);
export const isScraping = writable(false);
export const isPredicting = writable(false);
export const scrapeError = writable<string | null>(null);
export const predictError = writable<string | null>(null);

/**
 * Fetches lotto results and updates the store.
 */
export async function loadLottoResults() {
    isScraping.set(true);
    scrapeError.set(null);

    try {
        const response = await fetch('/api/scrape');
        const data = await response.json();

        if (data.success) {
            const results = data.results.map((r: any) => ({
                ...r,
                DrawDate: new Date(r.DrawDate)
            }));
            lottoResults.set(results);
        } else {
            scrapeError.set(data.error || 'Failed to fetch results');
        }
    } catch (err: any) {
        scrapeError.set(err.message || 'An unexpected error occurred');
    } finally {
        isScraping.set(false);
    }
}

/**
 * Fetches AI predictions and updates the store.
 */
export async function loadPredictions() {
    isPredicting.set(true);
    predictError.set(null);

    try {
        const response = await fetch('/api/predict');
        const data = await response.json();

        if (data.success) {
            predictions.set(data.predictions);
        } else {
            predictError.set(data.error || 'Failed to fetch predictions');
        }
    } catch (err: any) {
        predictError.set(err.message || 'An unexpected error occurred during prediction');
    } finally {
        isPredicting.set(false);
    }
}
