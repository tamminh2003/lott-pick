import type { LottoResult } from '$lib/models/LottoResult';
import type { NextDrawProbability } from '$lib/models/NextDrawProbability';

/**
 * Calculates lottery number frequencies from historical data and returns the top 7.
 * Used as a fallback when AI prediction fails.
 */
export function calculateEmpiricalProbabilities(history: LottoResult[], count: number = 7): NextDrawProbability[] {
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
        .slice(0, count);
}

/**
 * Calculates the most appearing combination of 3 numbers from history.
 */
export function calculateMostAppearingTriplets(history: LottoResult[], topCount: number = 10): { Numbers: number[], Count: number }[] {
    if (!history || history.length === 0) return [];

    const tripletFrequency: Record<string, number> = {};

    history.forEach(draw => {
        const numbers = [...draw.Primaries].sort((a, b) => a - b);

        // Generate all combinations of 3 numbers
        for (let i = 0; i < numbers.length - 2; i++) {
            for (let j = i + 1; j < numbers.length - 1; j++) {
                for (let k = j + 1; k < numbers.length; k++) {
                    const triplet = [numbers[i], numbers[j], numbers[k]];
                    const key = triplet.join(',');
                    tripletFrequency[key] = (tripletFrequency[key] || 0) + 1;
                }
            }
        }
    });

    // Convert to sorted array
    const sortedTriplets = Object.entries(tripletFrequency)
        .map(([key, count]) => ({
            Numbers: key.split(',').map(Number),
            Count: count
        }))
        .sort((a, b) => b.Count - a.Count);

    return sortedTriplets.slice(0, topCount);
}

/**
 * Calculates the most appearing combination of 2 numbers from history.
 */
export function calculateMostAppearingPairs(history: LottoResult[], topCount: number = 10): { Numbers: number[], Count: number }[] {
    if (!history || history.length === 0) return [];

    const pairFrequency: Record<string, number> = {};

    history.forEach(draw => {
        const numbers = [...draw.Primaries].sort((a, b) => a - b);

        // Generate all combinations of 2 numbers
        for (let i = 0; i < numbers.length - 1; i++) {
            for (let j = i + 1; j < numbers.length; j++) {
                const pair = [numbers[i], numbers[j]];
                const key = pair.join(',');
                pairFrequency[key] = (pairFrequency[key] || 0) + 1;
            }
        }
    });

    // Convert to sorted array
    const sortedPairs = Object.entries(pairFrequency)
        .map(([key, count]) => ({
            Numbers: key.split(',').map(Number),
            Count: count
        }))
        .sort((a, b) => b.Count - a.Count);

    return sortedPairs.slice(0, topCount);
}

/**
 * Calculates the most appearing combination of 4 numbers from history.
 */
export function calculateMostAppearingQuadruplets(history: LottoResult[], topCount: number = 10): { Numbers: number[], Count: number }[] {
    if (!history || history.length === 0) return [];

    const quadFrequency: Record<string, number> = {};

    history.forEach(draw => {
        const numbers = [...draw.Primaries].sort((a, b) => a - b);

        // Generate all combinations of 4 numbers
        for (let i = 0; i < numbers.length - 3; i++) {
            for (let j = i + 1; j < numbers.length - 2; j++) {
                for (let k = j + 1; k < numbers.length - 1; k++) {
                    for (let l = k + 1; l < numbers.length; l++) {
                        const quad = [numbers[i], numbers[j], numbers[k], numbers[l]];
                        const key = quad.join(',');
                        quadFrequency[key] = (quadFrequency[key] || 0) + 1;
                    }
                }
            }
        }
    });

    // Convert to sorted array
    const sortedQuads = Object.entries(quadFrequency)
        .map(([key, count]) => ({
            Numbers: key.split(',').map(Number),
            Count: count
        }))
        .sort((a, b) => b.Count - a.Count);

    return sortedQuads.slice(0, topCount);
}

export interface CombinedRanking {
    Numbers: number[];
    PairRank?: number;
    TripletRank?: number;
    QuadRank?: number;
    TotalScore: number;
}

/**
 * Matches top pairs, triplets, and quadruplets and ranks them by combined score.
 */
export function calculateCombinedRankings(history: LottoResult[]): CombinedRanking[] {
    const topPairs = calculateMostAppearingPairs(history, 21);
    const topTriplets = calculateMostAppearingTriplets(history, 21);
    const topQuads = calculateMostAppearingQuadruplets(history, 21);

    const pairMap = new Map<string, number>();
    topPairs.forEach((p, i) => pairMap.set(p.Numbers.join(','), i + 1));

    const tripletMap = new Map<string, number>();
    topTriplets.forEach((t, i) => tripletMap.set(t.Numbers.join(','), i + 1));

    const quadMap = new Map<string, number>();
    topQuads.forEach((q, i) => quadMap.set(q.Numbers.join(','), i + 1));

    const results: CombinedRanking[] = [];
    const usedTriplets = new Set<string>();

    // 1. Process Quadruplets (Top-down matching)
    topQuads.forEach(q => {
        const qNums = q.Numbers;
        const qKey = qNums.join(',');
        const qRank = quadMap.get(qKey)!;
        let matchedInQuad = false;

        // Check for Triplets within this Quad
        for (let i = 0; i < qNums.length; i++) {
            const tSub = qNums.filter((_, idx) => idx !== i);
            const tKey = tSub.join(',');
            if (tripletMap.has(tKey)) {
                const tRank = tripletMap.get(tKey)!;
                usedTriplets.add(tKey);
                matchedInQuad = true;

                // Check for Pairs within this Triplet
                let matchedPairInTri = false;
                for (let j = 0; j < tSub.length; j++) {
                    const pSub = tSub.filter((_, idx) => idx !== j);
                    const pKey = pSub.join(',');
                    if (pairMap.has(pKey)) {
                        const pRank = pairMap.get(pKey)!;
                        results.push({
                            Numbers: qNums,
                            QuadRank: qRank,
                            TripletRank: tRank,
                            PairRank: pRank,
                            TotalScore: qRank + tRank + pRank
                        });
                        matchedPairInTri = true;
                    }
                }

                if (!matchedPairInTri) {
                    results.push({
                        Numbers: qNums,
                        QuadRank: qRank,
                        TripletRank: tRank,
                        TotalScore: qRank + tRank
                    });
                }
            }
        }

        // Check for Pairs within this Quad (that weren't part of a matched Triplet above)
        // Strictly speaking, if a pair matches, it should be counted even if no triplet matches.
        if (!matchedInQuad) {
            for (let i = 0; i < qNums.length - 1; i++) {
                for (let j = i + 1; j < qNums.length; j++) {
                    const pSub = [qNums[i], qNums[j]];
                    const pKey = pSub.join(',');
                    if (pairMap.has(pKey)) {
                        results.push({
                            Numbers: qNums,
                            QuadRank: qRank,
                            PairRank: pairMap.get(pKey)!,
                            TotalScore: qRank + pairMap.get(pKey)!
                        });
                    }
                }
            }
        }
    });

    // 2. Process remaining Triplets (that weren't matched in a Quad)
    topTriplets.forEach(t => {
        const tNums = t.Numbers;
        const tKey = tNums.join(',');
        if (!usedTriplets.has(tKey)) {
            const tRank = tripletMap.get(tKey)!;
            let matchedPairInTri = false;

            for (let i = 0; i < tNums.length; i++) {
                const pSub = tNums.filter((_, idx) => idx !== i);
                const pKey = pSub.join(',');
                if (pairMap.has(pKey)) {
                    results.push({
                        Numbers: tNums,
                        TripletRank: tRank,
                        PairRank: pairMap.get(pKey)!,
                        TotalScore: tRank + pairMap.get(pKey)!
                    });
                    matchedPairInTri = true;
                }
            }
        }
    });

    // Sort results by TotalScore (lower is better)
    return results.sort((a, b) => a.TotalScore - b.TotalScore);
}
