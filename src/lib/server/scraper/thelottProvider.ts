import type { LottoResult } from '$lib/models/LottoResult';
import { getCachedResults, saveResultsToCache } from '../storage';
import type { ScraperInterface } from './interface';

const API_URL = 'https://data.api.thelott.com/sales/vmax/web/data/lotto/results/search/daterange';

export class TheLottScraper implements ScraperInterface {
    async fetchResultsRange(
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

    async scrapeHistoricalResults(
        startYear: number,
        endYear: number,
        product: string = 'TattsLotto',
        company: string = 'Tattersalls'
    ): Promise<LottoResult[]> {
        console.log(`[TheLott] Starting ${product} scrape check for ${startYear}-${endYear}`);

        // 1. Get cached data
        const cachedResults = await getCachedResults(product);
        console.log(`[TheLott] Retrieved ${cachedResults.length} draws from storage for ${product}.`);

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
            console.log(`[TheLott] All requested data for ${product} is up to date in cache.`);
            return cachedResults;
        }

        console.log(`[TheLott] Cache incomplete. Found ${payloads.length} months missing:`, payloads.map(p => p.monthKey).join(', '));

        let newDrawsCount = 0;
        const allResults = [...cachedResults];

        // 3. Process missing months in batches
        const concurrency = 10;
        for (let i = 0; i < payloads.length; i += concurrency) {
            const chunk = payloads.slice(i, i + concurrency);
            console.log(`[TheLott] Scraping batch ${Math.floor(i / concurrency) + 1}...`);

            const results = await Promise.all(
                chunk.map(p => this.fetchResultsRange(p.start, p.end, product, company).catch(err => {
                    console.error(`[TheLott] Error fetching sequence for ${p.monthKey}:`, err);
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
            console.log(`[TheLott] Adding ${newDrawsCount} new draws to ${product} cache. Total: ${allResults.length}`);
            allResults.sort((a, b) => a.DrawDate.getTime() - b.DrawDate.getTime());
            await saveResultsToCache(product, allResults);
        }

        console.log(`[TheLott] Finished. Returning ${allResults.length} draws for ${product}.`);
        return allResults;
    }
}

export const theLottScraper = new TheLottScraper();
