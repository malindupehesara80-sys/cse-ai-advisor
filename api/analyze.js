import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { company, prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on Vercel.' });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const fullPrompt = `You are an expert financial analyst for the Colombo Stock Exchange (CSE) in Sri Lanka. 
    Analyze the company or query: "${company || prompt}". 
    Provide financial insights, valuation context, risks, and explain key terms clearly. Answer in a mix of clear English and Sinhala (සිංහලෙන්) where appropriate for local investors. Keep it structured and easy to read on mobile.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
    });

    return res.status(200).json({ result: response.text });
  } catch (error) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate AI response' });
  }
}
