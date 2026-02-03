import { json } from '@sveltejs/kit';
import { scrapeAllHistoricalResults } from '$lib/server/scraper';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
    try {
        const product = url.searchParams.get('product') || 'TattsLotto';
        const company = url.searchParams.get('company') || 'Tattersalls';

        const startYear = parseInt(url.searchParams.get('startYear') || '2017');
        const endYear = parseInt(url.searchParams.get('endYear') || new Date().getFullYear().toString());

        const results = await scrapeAllHistoricalResults(startYear, endYear, product, company);
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
