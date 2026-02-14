import { json } from '@sveltejs/kit';
import { scrapeAllHistoricalResults } from '$lib/server/scraper';
import { calculateCombinedRankings } from '$lib/server/analysis';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
    try {
        const product = url.searchParams.get('product') || 'TattsLotto';
        const company = url.searchParams.get('company') || 'Tattersalls';

        // Fetch historical data (last few years)
        const history = await scrapeAllHistoricalResults(2023, new Date().getFullYear(), product, company);

        if (history.length === 0) {
            return json({ success: false, error: 'No historical data found to analyze' }, { status: 400 });
        }

        const rankings = calculateCombinedRankings(history);

        return json({
            success: true,
            rankings: rankings.slice(0, 15), // Return top 15 combined matches
            totalDraws: history.length
        });
    } catch (error: any) {
        console.error('Combined Analysis API error:', error);
        return json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
};
