import { json } from '@sveltejs/kit';
import { scrapeAllHistoricalResults } from '$lib/server/scraper';
import { calculateMostAppearingQuadruplets } from '$lib/server/analysis';
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

        const quadruplets = calculateMostAppearingQuadruplets(history, 21);

        return json({
            success: true,
            quadruplets,
            totalDraws: history.length
        });
    } catch (error: any) {
        console.error('Quadruplet Analysis API error:', error);
        return json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
};
