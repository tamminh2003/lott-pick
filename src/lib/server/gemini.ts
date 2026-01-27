import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '$env/dynamic/private';
import type { LottoResult } from '$lib/models/LottoResult';
import type { NextDrawProbability } from '$lib/models/NextDrawProbability';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export async function getTopPredictions(history: LottoResult[], count: number = 7): Promise<NextDrawProbability[]> {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Prepare a concise summary of the history to keep token count down
    // We'll provide the last 50 draws as context
    const recentHistory = history.slice(-50).map(draw => ({
        n: draw.DrawNumber,
        p: draw.Primaries,
        s: draw.Secondaries
    }));

    const prompt = `
        Analyze the following historical lottery data (last 50 draws). 
        Based on empirical probability and frequency analysis, predict the top ${count} numbers most likely to appear in the next draw.
        Provide the response ONLY as a JSON array of objects, where each object has "Number" (int) and "Probability" (float between 0 and 1, representing your confidence score/estimated frequency).

        Data: ${JSON.stringify(recentHistory)}

        Response format example:
        [{"Number": 1, "Probability": 0.15}, {"Number": 2, "Probability": 0.12}, ...]
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Clean up potential markdown formatting if Gemini includes it
    const jsonString = text.replace(/```json\n?|\n?```/g, '').trim();

    try {
        const predictions: NextDrawProbability[] = JSON.parse(jsonString);
        return predictions.sort((a, b) => b.Probability - a.Probability).slice(0, count);
    } catch (e) {
        console.error("Failed to parse Gemini response:", text);
        throw new Error("Invalid response from AI");
    }
}
