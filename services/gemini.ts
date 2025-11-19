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

/**
 * Analyzes the attractiveness of a commission offer for creators.
 */
export const analyzeCommissionOffer = async (price: number, rate: number, description: string): Promise<string> => {
    try {
        const client = getAiClient();
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze this commission offer: Product Price $${price}, Commission Rate ${rate}%, Description: "${description}". 
            Is this attractive to creators? Reply in 1 short sentence starting with "Verdict:".`,
        });
        return response.text || "Analysis unavailable.";
    } catch (e) {
        console.error("Gemini API Error:", e);
        return "AI Analysis failed.";
    }
};

/**
 * Generates a unique, catchy affiliate code using AI.
 */
export const generateAffiliateCode = async (creatorName: string, productName: string): Promise<string> => {
  try {
    const client = getAiClient();
    const prompt = `Generate a short, catchy, uppercase affiliate code (max 8 chars) combining "${creatorName}" and "${productName}". Alphanumeric only. Return ONLY the code.`;
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    let code = response.text?.trim().replace(/[^A-Z0-9]/g, '') || '';
    if (code.length > 10) code = code.substring(0, 10);
    return code || (creatorName.substring(0,3) + productName.substring(0,3)).toUpperCase();
  } catch (e) {
    // Fallback
    return (creatorName.substring(0,3) + productName.substring(0,3)).toUpperCase() + Math.floor(Math.random() * 1000);
  }
};