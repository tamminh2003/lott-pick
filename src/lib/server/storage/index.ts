import { blobStorage } from './netlifyBlobs';
import type { StorageInterface, AnalysisResult } from './interface';
import type { LottoResult } from '$lib/models/LottoResult';

/**
 * The default storage provider for the application.
 * Swap this instance to change the storage backend globally.
 */
export const storage: StorageInterface = blobStorage;

// Export helper functions for convenience and cleaner consumer code
export const getCachedResults = (product: string): Promise<LottoResult[]> =>
    storage.getCachedResults(product);

export const saveResultsToCache = (product: string, results: LottoResult[]): Promise<void> =>
    storage.saveResultsToCache(product, results);

export const getCachedAnalysis = (product: string): Promise<AnalysisResult | null> =>
    storage.getCachedAnalysis(product);

export const saveAnalysisResult = (analysis: AnalysisResult): Promise<void> =>
    storage.saveAnalysisResult(analysis);

// Export shared types
export type { AnalysisResult };
