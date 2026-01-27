import type { LottoResult } from '$lib/models/LottoResult';
import type { NextDrawProbability } from '$lib/models/NextDrawProbability';

/**
 * Calculates lottery number frequencies from historical data and returns the top 7.
 * Used as a fallback when AI prediction fails.
 */
export function calculateEmpiricalProbabilities(history: LottoResult[]): NextDrawProbability[] {
    if (!history || history.length === 0) return [];

    const frequencyMap: Record<number, number> = {};
    let totalNumbersCount = 0;

    // Analyze all primary numbers in history
    history.forEach(draw => {
        draw.Primaries.forEach(num => {
            frequencyMap[num] = (frequencyMap[num] || 0) + 1;
            totalNumbersCount++;
        });
    });

    // Convert map to array of NextDrawProbability objects
    const probabilities: NextDrawProbability[] = Object.entries(frequencyMap).map(([num, count]) => ({
        Number: parseInt(num),
        Probability: count / history.length // Probability of appearing in a draw
    }));

    // Sort by probability descending and take top 7
    return probabilities
        .sort((a, b) => b.Probability - a.Probability)
        .slice(0, 7);
}
