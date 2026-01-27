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

/**
 * Scrapes all results from a start year to an end year.
 * This mimics the logic in scrape_logic.js
 */
export async function scrapeAllHistoricalResults(
    startYear: number,
    endYear: number,
    product: string = 'TattsLotto',
    company: string = 'Tattersalls'
): Promise<LottoResult[]> {
    let allDraws: LottoResult[] = [];
    const payloads: { start: Date, end: Date }[] = [];

    for (let year = startYear; year <= endYear; year++) {
        for (let month = 0; month < 12; month++) {
            // month is 0-indexed (0 for Jan, 11 for Dec)
            // DateStart: 13:00:00Z on the last day of the previous month.
            const startDate = new Date(Date.UTC(year, month, 0, 13, 0, 0));
            // DateEnd: 12:59:59Z on the last day of the current month.
            const endDate = new Date(Date.UTC(year, month + 1, 0, 12, 59, 59));

            payloads.push({ start: startDate, end: endDate });
        }
    }

    // Process in batches (concurrency 10 as in example)
    const concurrency = 10;
    for (let i = 0; i < payloads.length; i += concurrency) {
        const chunk = payloads.slice(i, i + concurrency);
        console.log(`Scraping batch ${i / concurrency + 1}...`);

        const results = await Promise.all(
            chunk.map(p => fetchLottoResultsRange(p.start, p.end, product, company).catch(err => {
                console.error(`Error fetching sequence:`, err);
                return [];
            }))
        );

        results.forEach(draws => {
            allDraws.push(...draws);
        });
    }

    // Sort by date ascending
    allDraws.sort((a, b) => a.DrawDate.getTime() - b.DrawDate.getTime());

    return allDraws;
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
