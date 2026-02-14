import { json } from '@sveltejs/kit';
import { scrapeAllHistoricalResults } from '$lib/server/scraper';
import { calculateLeastAppearingNumbers } from '$lib/server/analysis';
import type { RequestHandler, RequestEvent } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }: RequestEvent) => {
    try {
        const product = url.searchParams.get('product') || 'TattsLotto';
        const company = url.searchParams.get('company') || 'Tattersalls';

        // Fetch historical data (last few years)
        const history = await scrapeAllHistoricalResults(2023, new Date().getFullYear(), product, company);

        if (history.length === 0) {
            return json({ success: false, error: 'No historical data found to analyze' }, { status: 400 });
        }

        const coldNumbers = calculateLeastAppearingNumbers(history, 7);

        return json({
            success: true,
            coldNumbers,
            totalDraws: history.length
        });
    } catch (error: any) {
        console.error('Cold Numbers Analysis API error:', error);
        return json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
};
