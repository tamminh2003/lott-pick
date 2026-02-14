import { writable, get } from 'svelte/store';
import type { LottoResult } from '$lib/models/LottoResult';
import type { NextDrawProbability } from '$lib/models/NextDrawProbability';
import tattslottoIcon from '$lib/assets/tattslotto_icon.webp';
import ozlottoIcon from '$lib/assets/ozlotto_icon.avif';
import powerballIcon from '$lib/assets/powerball_icon.avif';

export interface LottoConfig {
    name: string;
    product: string;
    company: string;
    primaryColor: string;
    secondaryColor: string;
    predictionCount: number;
    icon: string;
}

export const LOTTO_TYPES: LottoConfig[] = [
    {
        name: 'TattsLotto',
        product: 'TattsLotto',
        company: 'Tattersalls',
        primaryColor: '#ef4444', // Red
        secondaryColor: '#3b82f6', // Blue
        predictionCount: 7,
        icon: tattslottoIcon
    },
    {
        name: 'OzLotto',
        product: 'OzLotto',
        company: 'Tattersalls',
        primaryColor: '#eab308', // Yellow
        secondaryColor: '#15803d', // Green
        predictionCount: 9,
        icon: ozlottoIcon
    },
    {
        name: 'Powerball',
        product: 'Powerball',
        company: 'Tattersalls',
        primaryColor: '#2563eb', // Blue
        secondaryColor: '#1e3a8a', // Dark Blue
        predictionCount: 8,
        icon: powerballIcon
    }
];

export const selectedLotto = writable<LottoConfig>(LOTTO_TYPES[0]);
export const lottoResults = writable<LottoResult[] | null>(null);
export const predictions = writable<NextDrawProbability[] | null>(null);
export const isScraping = writable(false);
export const isPredicting = writable(false);
export const scrapeError = writable<string | null>(null);
export const predictError = writable<string | null>(null);
export const tripletAnalysis = writable<{ triplets: { Numbers: number[], Count: number }[], totalDraws: number } | null>(null);
export const isAnalyzingTriplets = writable(false);
export const tripletError = writable<string | null>(null);
export const pairAnalysis = writable<{ pairs: { Numbers: number[], Count: number }[], totalDraws: number } | null>(null);
export const isAnalyzingPairs = writable(false);
export const pairError = writable<string | null>(null);
export const quadrupletAnalysis = writable<{ quadruplets: { Numbers: number[], Count: number }[], totalDraws: number } | null>(null);
export const isAnalyzingQuadruplets = writable(false);
export const quadrupletError = writable<string | null>(null);
export const combinedAnalysis = writable<{ rankings: any[], totalDraws: number } | null>(null);
export const isAnalyzingCombined = writable(false);
export const combinedError = writable<string | null>(null);

/**
 * Fetches lotto results and updates the store.
 */
export async function loadLottoResults() {
    if (get(isScraping)) return;

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
    if (get(isPredicting)) return;

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
 * Fetches triplet analysis and updates the store.
 */
export async function loadTripletAnalysis() {
    if (get(isAnalyzingTriplets)) return;

    isAnalyzingTriplets.set(true);
    tripletError.set(null);
    const config = get(selectedLotto);

    try {
        const response = await fetch(`/api/analysis/triplets?product=${config.product}&company=${config.company}`);
        const data = await response.json();

        if (data.success) {
            tripletAnalysis.set({
                triplets: data.triplets,
                totalDraws: data.totalDraws
            });
        } else {
            tripletError.set(data.error || 'Failed to fetch triplet analysis');
        }
    } catch (err: any) {
        tripletError.set(err.message || 'An unexpected error occurred during triplet analysis');
    } finally {
        isAnalyzingTriplets.set(false);
    }
}

/**
 * Fetches pair analysis and updates the store.
 */
export async function loadPairAnalysis() {
    if (get(isAnalyzingPairs)) return;

    isAnalyzingPairs.set(true);
    pairError.set(null);
    const config = get(selectedLotto);

    try {
        const response = await fetch(`/api/analysis/pairs?product=${config.product}&company=${config.company}`);
        const data = await response.json();

        if (data.success) {
            pairAnalysis.set({
                pairs: data.pairs,
                totalDraws: data.totalDraws
            });
        } else {
            pairError.set(data.error || 'Failed to fetch pair analysis');
        }
    } catch (err: any) {
        pairError.set(err.message || 'An unexpected error occurred during pair analysis');
    } finally {
        isAnalyzingPairs.set(false);
    }
}

/**
 * Fetches quadruplet analysis and updates the store.
 */
export async function loadQuadrupletAnalysis() {
    if (get(isAnalyzingQuadruplets)) return;

    isAnalyzingQuadruplets.set(true);
    quadrupletError.set(null);
    const config = get(selectedLotto);

    try {
        const response = await fetch(`/api/analysis/quadruplets?product=${config.product}&company=${config.company}`);
        const data = await response.json();

        if (data.success) {
            quadrupletAnalysis.set({
                quadruplets: data.quadruplets,
                totalDraws: data.totalDraws
            });
        } else {
            quadrupletError.set(data.error || 'Failed to fetch quadruplet analysis');
        }
    } catch (err: any) {
        quadrupletError.set(err.message || 'An unexpected error occurred during quadruplet analysis');
    } finally {
        isAnalyzingQuadruplets.set(false);
    }
}

/**
 * Fetches combined ranking analysis and updates the store.
 */
export async function loadCombinedAnalysis() {
    if (get(isAnalyzingCombined)) return;

    isAnalyzingCombined.set(true);
    combinedError.set(null);
    const config = get(selectedLotto);

    try {
        const response = await fetch(`/api/analysis/combined?product=${config.product}&company=${config.company}`);
        const data = await response.json();

        if (data.success) {
            combinedAnalysis.set({
                rankings: data.rankings,
                totalDraws: data.totalDraws
            });
        } else {
            combinedError.set(data.error || 'Failed to fetch combined analysis');
        }
    } catch (err: any) {
        combinedError.set(err.message || 'An unexpected error occurred during combined analysis');
    } finally {
        isAnalyzingCombined.set(false);
    }
}

/**
 * Initializes all data for the selected lotto.
 */
export async function initLottoData() {
    await loadLottoResults();
    await Promise.all([
        loadPredictions(),
        loadTripletAnalysis(),
        loadPairAnalysis(),
        loadQuadrupletAnalysis(),
        loadCombinedAnalysis()
    ]);
}

/**
 * Changes the selected lottery type and reloads data.
 */
export async function changeLottoType(config: LottoConfig) {
    selectedLotto.set(config);
    lottoResults.set(null);
    predictions.set(null);
    tripletAnalysis.set(null);
    pairAnalysis.set(null);
    quadrupletAnalysis.set(null);
    combinedAnalysis.set(null);
    await initLottoData();
}
