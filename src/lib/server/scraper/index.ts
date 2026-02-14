import { theLottScraper } from './thelottProvider';
import type { ScraperInterface } from './interface';
import type { LottoResult } from '$lib/models/LottoResult';

/**
 * The default scraper provider for the application.
 */
export const scraper: ScraperInterface = theLottScraper;

// Export helper functions for convenience and cleaner consumer code
export const fetchLottoResultsRange = (
    dateStart: Date,
    dateEnd: Date,
    product?: string,
    company?: string
): Promise<LottoResult[]> => scraper.fetchResultsRange(dateStart, dateEnd, product, company);

export const scrapeAllHistoricalResults = (
    startYear: number,
    endYear: number,
    product?: string,
    company?: string
): Promise<LottoResult[]> => scraper.scrapeHistoricalResults(startYear, endYear, product, company);

/**
 * Converts LottoResult array to CSV format compatible with the original project.
 */
export function convertToCSV(draws: LottoResult[]): string {
    if (!draws || draws.length === 0) return '';

    const headers = ['DrawNumber', 'DrawDate', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'S1', 'S2'];

    const rows = draws.map(draw => {
        return [
            draw.DrawNumber,
            draw.DrawDate.toISOString(),
            ...draw.Primaries,
            ...draw.Secondaries
        ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
}
