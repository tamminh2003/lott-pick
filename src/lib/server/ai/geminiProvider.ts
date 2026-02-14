import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '$env/dynamic/private';
import type { LottoResult } from '$lib/models/LottoResult';
import type { NextDrawProbability } from '$lib/models/NextDrawProbability';
import { getCachedAnalysis, saveAnalysisResult, type AnalysisResult } from '../storage';
import type { AIInterface } from './interface';

const MODEL_NAME = 'gemini-2.5-flash';
const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export class GeminiProvider implements AIInterface {
    async getTopPredictions(history: LottoResult[], product: string, count: number = 7): Promise<NextDrawProbability[]> {
        // 1. Check if result is current (less than 24 hours old)
        const cached = await getCachedAnalysis(product);
        if (cached) {
            const lastRun = new Date(cached.ResultDate);
            const now = new Date();
            const diffMs = now.getTime() - lastRun.getTime();
            const diffHours = diffMs / (1000 * 60 * 60);

            if (diffHours < 24) {
                console.log(`[Gemini] Using cached results for ${product} (last updated: ${cached.ResultDate})`);
                return cached.Result;
            }
            console.log(`[Gemini] Cache expired for ${product} (${diffHours.toFixed(1)}h old). Refreshing...`);
        }

        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        // Prepare a concise summary of the history to keep token count down
        const recentHistory = history.slice(-50).map(draw => ({
            n: draw.DrawNumber,
            p: draw.Primaries
        }));

        const prompt = `
            Analyze the following historical lottery data (last 50 draws). 
            The data contains the "DrawNumber" (n) and "PrimaryNumbers" (p).
            
            Task: Based on empirical probability and frequency analysis of the PRIMARY numbers (p), predict the top ${count} numbers most likely to appear in the next draw's main selection.
            
            IMPORTANT: This is for the main number selection only. Provide the response ONLY as a JSON array of objects, where each object has "Number" (int) and "Probability" (float between 0 and 1, representing your confidence score/estimated frequency).
    
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
            const sortedPredictions = predictions.sort((a, b) => b.Probability - a.Probability).slice(0, count);

            // 2. Save result to Storage
            const analysisResult: AnalysisResult = {
                Model: MODEL_NAME,
                Product: product,
                Result: sortedPredictions,
                ResultDate: new Date().toISOString()
            };
            await saveAnalysisResult(analysisResult);

            return sortedPredictions;
        } catch (e) {
            console.error("Failed to parse Gemini response:", text);
            throw new Error("Invalid response from AI");
        }
    }
}

export const geminiProvider = new GeminiProvider();
