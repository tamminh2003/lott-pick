import { geminiProvider } from './geminiProvider';
import type { AIInterface } from './interface';
import type { LottoResult } from '$lib/models/LottoResult';
import type { NextDrawProbability } from '$lib/models/NextDrawProbability';

/**
 * The default AI provider for the application.
 */
export const ai: AIInterface = geminiProvider;

// Export helper functions for convenience and cleaner consumer code
export const getTopPredictions = (
    history: LottoResult[],
    product: string,
    count?: number
): Promise<NextDrawProbability[]> => ai.getTopPredictions(history, product, count);
