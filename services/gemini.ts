import { GoogleGenAI } from "@google/genai";

// Initialize the client only when needed to avoid premature env usage
let aiClient: GoogleGenAI | null = null;

const getAiClient = (): GoogleGenAI => {
  if (!aiClient) {
    if (!process.env.API_KEY) {
      console.warn("API_KEY is missing from environment variables.");
    }
    aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }
  return aiClient;
};

/**
 * Example function to generate a job description based on basic inputs.
 * You can use this later in the Business Dashboard.
 */
export const generateJobDescription = async (brandName: string, productType: string): Promise<string> => {
  try {
    const client = getAiClient();
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a catchy, professional UGC job description for a brand named "${brandName}" selling "${productType}". 
      Focus on high energy and authenticity. Keep it under 150 words.`,
    });
    return response.text || "No description generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate description via AI.";
  }
};