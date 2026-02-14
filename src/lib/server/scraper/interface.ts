import type { LottoResult } from '$lib/models/LottoResult';

/**
 * Interface for lottery result scrapers.
 */
export interface ScraperInterface {
    /**
     * Scrapes results for a specific date range.
     */
    fetchResultsRange(
        dateStart: Date,
        dateEnd: Date,
        product?: string,
        company?: string
    ): Promise<LottoResult[]>;

    /**
     * Scrapes all results from a start year to an end year, accumulatively.
     * Implementations should handle caching if necessary, or be wrapped by a caching layer.
     */
    scrapeHistoricalResults(
        startYear: number,
        endYear: number,
        product?: string,
        company?: string
    ): Promise<LottoResult[]>;
}
