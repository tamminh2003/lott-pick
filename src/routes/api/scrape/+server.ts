import { json } from '@sveltejs/kit';
import { scrapeAllHistoricalResults } from '$lib/server/scraper';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
    try {
        const results = await scrapeAllHistoricalResults(2024, 2025); // Just a sample range for the API
        return json({
            success: true,
            total: results.length,
            results
        });
    } catch (error: any) {
        return json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
};
