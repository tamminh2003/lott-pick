import type { LottoResult } from '$lib/models/LottoResult';
import type { NextDrawProbability } from '$lib/models/NextDrawProbability';

export interface AnalysisResult {
    Model: string;
    Product: string;
    Result: NextDrawProbability[];
    ResultDate: string;
}

/**
 * Interface for storage backends (Netlify Blobs, SQL, NoSQL, etc.)
 */
export interface StorageInterface {
    /**
     * Loads historical results for a specific product.
     */
    getCachedResults(product: string): Promise<LottoResult[]>;

    /**
     * Saves results to storage.
     */
    saveResultsToCache(product: string, results: LottoResult[]): Promise<void>;

    /**
     * Loads cached AI analysis for a specific product.
     */
    getCachedAnalysis(product: string): Promise<AnalysisResult | null>;

    /**
     * Saves AI analysis result to storage.
     */
    saveAnalysisResult(analysis: AnalysisResult): Promise<void>;
}
