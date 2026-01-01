
import { GoogleGenAI } from "@google/genai";
import { UserPreferences } from "../types";

export class GeminiService {
    private ai: GoogleGenAI;

    constructor() {
        // API KEY is handled by environment variable process.env.API_KEY as per requirements
        this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    }

    async generateExplanation(content: string, preferences: UserPreferences): Promise<{ text: string, tokens: number }> {
        const prompt = `
            You are a world-class specialized lexicon clarifier. 
            Your goal is to simplify complex legal, financial, or technical text for a specific audience.
            
            Style: ${preferences.defaultExplanationStyle}
            Target Audience: ${preferences.targetAudienceLevel}
            
            TEXT TO CLARIFY:
            "${content}"
            
            Provide a clear, concise, and accurate simplification.
        `;

        try {
            const result = await this.ai.models.generateContent({
                model: preferences.defaultAIModel,
                contents: prompt,
                config: {
                    temperature: 0.4,
                    maxOutputTokens: 2048,
                    topP: 0.8,
                }
            });

            return {
                text: result.text || "I'm sorry, I couldn't generate an explanation for that content.",
                tokens: Math.ceil(content.length / 4) + Math.ceil((result.text?.length || 0) / 4)
            };
        } catch (error) {
            console.error("Gemini API Error:", error);
            throw new Error("Failed to communicate with AI model.");
        }
    }
}

export const geminiService = new GeminiService();
