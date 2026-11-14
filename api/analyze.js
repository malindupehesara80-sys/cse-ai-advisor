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

    const targetQuery = company || prompt;
    const fullPrompt = `You are an expert financial analyst for the Colombo Stock Exchange (CSE) in Sri Lanka. 
Analyze the company or query: "${targetQuery}". 
Provide financial insights, valuation context, risks, and explain key terms clearly. Answer in a mix of clear English and Sinhala (සිංහලෙන්) where appropriate for local investors. Keep it structured and easy to read on mobile.`;

    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$](https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$){apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: fullPrompt }]
        }]
      })
    });

    const data = await geminiResponse.json();

    if (!geminiResponse.ok) {
      throw new Error(data.error?.message || 'Failed to communicate with Gemini API');
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';

    return res.status(200).json({ result: aiText });
  } catch (error) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate AI response' });
  }
}
