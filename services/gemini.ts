import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Promise wrapper with timeout to prevent infinite loading states.
 */
const withTimeout = <T>(promise: Promise<T>, ms: number = 10000, fallbackValue: T): Promise<T> => {
  const timeout = new Promise<T>((resolve) => {
    setTimeout(() => {
      console.warn("AI Request Timed Out - Using Fallback");
      resolve(fallbackValue);
    }, ms);
  });
  return Promise.race([promise, timeout]);
};

export const generateAffiliateCode = async (creatorName: string, productName: string): Promise<string> => {
  const apiCall = async () => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate a single, short, catchy, alphanumeric affiliate code (max 10 chars) for a creator named "${creatorName}" promoting a product called "${productName}". Return only the code string in uppercase.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              code: { type: Type.STRING }
            }
          }
        }
      });
      
      const json = JSON.parse(response.text || '{"code": "UGC123"}');
      return json.code || "UGC2024";
    } catch (error) {
      console.error("Error generating code:", error);
      return `${creatorName.substring(0, 3).toUpperCase()}2024`;
    }
  };

  return withTimeout(apiCall(), 8000, `${creatorName.substring(0, 3).toUpperCase()}2024`);
};

export const analyzeCommissionOffer = async (productPrice: number, commissionRate: number, description: string): Promise<string> => {
  const apiCall = async () => {
     try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze this offer for a UGC commission-only platform. 
        Product: ${description}. 
        Price: $${productPrice}. 
        Commission Rate: ${commissionRate}%.
        
        Context: Since businesses pay NO fees to list, commissions must be higher than standard (usually 20-30%+).
        Is this a good deal for creators? Answer in 2 sentences.`,
      });
      return response.text || "Analysis unavailable.";
    } catch (error) {
      console.error("Error analyzing offer:", error);
      return "Could not analyze offer at this time.";
    }
  };
  
  return withTimeout(apiCall(), 10000, "AI Analysis unavailable due to network timeout.");
};

export const generateBusinessAgreement = async (companyName: string, frequency: string, rate: number): Promise<string> => {
  const fallback = `I, representing ${companyName}, agree to pay commissions of ${rate}% on a ${frequency} basis. I understand that failure to pay on time will result in immediate suspension of sales and unpaid balances will be sent to collections.`;
  
  const apiCall = async () => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Draft a strict Service Agreement clause (approx 100 words) for a business named "${companyName}".
        Terms: They agree to pay ${rate}% commission on a ${frequency} basis.
        Crucial Clause: If payment is not received within the agreed timeframe, all sales activities will cease immediately.
        Crucial Clause: Any arrears (unpaid commissions) will be immediately sent to collections.
        Tone: Formal, binding, strict.`,
      });
      return response.text || fallback;
    } catch (error) {
       return fallback;
    }
  };

  return withTimeout(apiCall(), 10000, fallback);
};

export const generatePaymentDisclaimer = async (businessName: string, creatorName: string): Promise<string> => {
   const fallback = "Please initiate the transfer directly to the creator using the details provided below.";
   
   const apiCall = async () => {
     try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Draft a 1 sentence instruction for a payment page.
        Context: The business (${businessName}) is paying the creator (${creatorName}) directly for their share.
        Tone: Instructional, neutral.
        Text: Please initiate the transfer directly to the creator using the details provided below.`,
      });
      return response.text || fallback;
    } catch (error) {
       return fallback;
    }
   };

   return withTimeout(apiCall(), 5000, fallback);
}