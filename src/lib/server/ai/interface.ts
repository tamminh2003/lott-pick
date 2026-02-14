import type { LottoResult } from '$lib/models/LottoResult';
import type { NextDrawProbability } from '$lib/models/NextDrawProbability';

/**
 * Interface for AI lottery analysis providers.
 */
export interface AIInterface {
    /**
     * Gets the top predictions based on historical lottery data.
     */
    getTopPredictions(
        history: LottoResult[],
        product: string,
        count?: number
    ): Promise<NextDrawProbability[]>;
}
