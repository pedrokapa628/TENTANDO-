
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { AIResponse, Difficulty } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async getNextStep(prompt: string, history: { role: 'user' | 'model'; text: string }[], difficulty: Difficulty): Promise<AIResponse> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
        { role: 'user', parts: [{ text: `[DIFFICULTY: ${difficulty}] ${prompt}` }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sceneDescription: { type: Type.STRING },
            statusUpdate: { type: Type.STRING },
            actions: { type: Type.ARRAY, items: { type: Type.STRING } },
            imagePrompt: { type: Type.STRING },
            newInventoryItems: { type: Type.ARRAY, items: { type: Type.STRING } },
            healthChange: { type: Type.NUMBER },
            scoreChange: { type: Type.NUMBER },
            locationName: { type: Type.STRING }
          },
          required: ["sceneDescription", "statusUpdate", "actions", "imagePrompt", "locationName"]
        }
      }
    });

    return JSON.parse(response.text || '{}') as AIResponse;
  }

  async generateSceneImage(prompt: string): Promise<string | null> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: `Cinematic cyberpunk concept art: ${prompt}. High resolution, neon lighting, futuristic atmosphere.` }]
        },
        config: {
          imageConfig: {
            aspectRatio: "16:9"
          }
        }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
      return null;
    } catch (error) {
      console.error("Image generation failed", error);
      return null;
    }
  }
}

export const geminiService = new GeminiService();
