import { json } from '@sveltejs/kit';
import { scrapeAllHistoricalResults } from '$lib/server/scraper';
import { getTopPredictions } from '$lib/server/gemini';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
    try {
        // Fetch historical data for context (last 2 years approx)
        const history = await scrapeAllHistoricalResults(2024, 2025);

        if (history.length === 0) {
            return json({ success: false, error: 'No historical data found to analyze' }, { status: 400 });
        }

        const predictions = await getTopPredictions(history);

        return json({
            success: true,
            predictions
        });
    } catch (error: any) {
        console.error('Prediction API error:', error);
        return json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
};
