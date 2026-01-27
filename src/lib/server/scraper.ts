import type { LottoResult } from '$lib/models/LottoResult';

const API_URL = 'https://data.api.thelott.com/sales/vmax/web/data/lotto/results/search/daterange';

/**
 * Scrapes Tats Lotto results for a specific date range.
 * @param dateStart Start date
 * @param dateEnd End date
 * @returns Array of LottoResult objects
 */
export async function fetchLottoResultsRange(
    dateStart: Date,
    dateEnd: Date,
    product: string = 'TattsLotto',
    company: string = 'Tattersalls'
): Promise<LottoResult[]> {
    const payload = {
        "DateStart": dateStart.toISOString().replace('.000Z', 'Z'),
        "DateEnd": dateEnd.toISOString().replace('.000Z', 'Z'),
        "ProductFilter": [product],
        "CompanyFilter": [company]
    };

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Accept-Language': 'en-GB,en;q=0.9',
            'Referer': 'https://www.thelott.com/',
            'Origin': 'https://www.thelott.com',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-site'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.Success) {
        throw new Error(`API error! message: ${JSON.stringify(data.ErrorInfo)}`);
    }

    return (data.Draws || []).map((draw: any) => ({
        DrawNumber: draw.DrawNumber,
        DrawDate: new Date(draw.DrawDate),
        Primaries: draw.PrimaryNumbers,
        Secondaries: draw.SecondaryNumbers
    }));
}

import { getCachedResults, saveResultsToCache } from './blobs';

/**
 * Scrapes all results from a start year to an end year, accumulatively.
 * It reads the cache first, finds missing months, and only scrapes what's needed.
 */
export async function scrapeAllHistoricalResults(
    startYear: number,
    endYear: number,
    product: string = 'TattsLotto',
    company: string = 'Tattersalls'
): Promise<LottoResult[]> {
    console.log(`[Scraper] Starting ${product} scrape check for ${startYear}-${endYear}`);

    // 1. Get cached data
    const cachedResults = await getCachedResults(product);
    console.log(`[Scraper] Retrieved ${cachedResults.length} draws from Netlify Blobs for ${product}.`);

    const cachedDrawNumbers = new Set(cachedResults.map(d => d.DrawNumber));

    // 2. Determine which months we need to check
    const payloads: { start: Date, end: Date, monthKey: string }[] = [];
    const now = new Date();

    for (let year = startYear; year <= endYear; year++) {
        for (let month = 0; month < 12; month++) {
            const checkDate = new Date(Date.UTC(year, month, 1));
            if (checkDate > now) continue;

            const monthKey = `${year}-${month}`;
            const startDate = new Date(Date.UTC(year, month, 0, 13, 0, 0));
            const endDate = new Date(Date.UTC(year, month + 1, 0, 12, 59, 59));

            const hasMonthInCache = cachedResults.some(d =>
                d.DrawDate >= startDate && d.DrawDate <= endDate
            );

            if (!hasMonthInCache) {
                payloads.push({ start: startDate, end: endDate, monthKey });
            }
        }
    }

    if (payloads.length === 0) {
        console.log(`[Scraper] All requested data for ${product} is up to date in cache.`);
        return cachedResults;
    }

    console.log(`[Scraper] Cache incomplete. Found ${payloads.length} months missing:`, payloads.map(p => p.monthKey).join(', '));

    let newDrawsCount = 0;
    const allResults = [...cachedResults];

    // 3. Process missing months in batches
    const concurrency = 10;
    for (let i = 0; i < payloads.length; i += concurrency) {
        const chunk = payloads.slice(i, i + concurrency);
        console.log(`[Scraper] Scraping batch ${Math.floor(i / concurrency) + 1}...`);

        const results = await Promise.all(
            chunk.map(p => fetchLottoResultsRange(p.start, p.end, product, company).catch(err => {
                console.error(`[Scraper] Error fetching sequence for ${p.monthKey}:`, err);
                return [];
            }))
        );

        results.forEach(draws => {
            if (draws) {
                draws.forEach(draw => {
                    if (!cachedDrawNumbers.has(draw.DrawNumber)) {
                        allResults.push(draw);
                        cachedDrawNumbers.add(draw.DrawNumber);
                        newDrawsCount++;
                    }
                });
            }
        });
    }

    // 4. Update cache if we found new data
    if (newDrawsCount > 0) {
        console.log(`[Scraper] Adding ${newDrawsCount} new draws to ${product} cache. Total: ${allResults.length}`);
        allResults.sort((a, b) => a.DrawDate.getTime() - b.DrawDate.getTime());
        await saveResultsToCache(product, allResults);
    }

    console.log(`[Scraper] Finished. Returning ${allResults.length} draws for ${product}.`);
    return allResults;
}

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
