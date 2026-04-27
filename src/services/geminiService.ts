import { GoogleGenAI, ThinkingLevel } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getGenAI() {
  if (!aiInstance) {
    const apiKey = (process.env as any).GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export async function generateReflection(prompt: string) {
  try {
    const ai = getGenAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.LOW
        }
      }
    });

    if (!response.text) {
        console.warn("Gemini returned empty text.");
        return "";
    }

    return response.text.trim();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "";
  }
}
