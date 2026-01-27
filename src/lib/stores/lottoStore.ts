import { writable, get } from 'svelte/store';
import type { LottoResult } from '$lib/models/LottoResult';
import type { NextDrawProbability } from '$lib/models/NextDrawProbability';

export interface LottoConfig {
    name: string;
    product: string;
    company: string;
    primaryColor: string;
    secondaryColor: string;
    predictionCount: number;
}

export const LOTTO_TYPES: LottoConfig[] = [
    {
        name: 'TattsLotto',
        product: 'TattsLotto',
        company: 'Tattersalls',
        primaryColor: '#ef4444', // Red
        secondaryColor: '#3b82f6', // Blue
        predictionCount: 7
    },
    {
        name: 'OzLotto',
        product: 'OzLotto',
        company: 'Tattersalls',
        primaryColor: '#eab308', // Yellow
        secondaryColor: '#15803d', // Green
        predictionCount: 9
    }
];

export const selectedLotto = writable<LottoConfig>(LOTTO_TYPES[0]);
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
    const config = get(selectedLotto);

    try {
        const response = await fetch(`/api/scrape?product=${config.product}&company=${config.company}`);
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
    const config = get(selectedLotto);

    try {
        const response = await fetch(`/api/predict?product=${config.product}&company=${config.company}&count=${config.predictionCount}`);
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

/**
 * Changes the selected lottery type and reloads data.
 */
export function changeLottoType(config: LottoConfig) {
    selectedLotto.set(config);
    lottoResults.set(null);
    predictions.set(null);
    loadLottoResults();
    loadPredictions();
}
