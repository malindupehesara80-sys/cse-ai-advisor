export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { company, prompt } = req.body;
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'GROQ_API_KEY is not configured on Vercel.' });
    }

    const targetQuery = company || prompt;
    const fullPrompt = `You are an expert financial analyst for the Colombo Stock Exchange (CSE) in Sri Lanka. 
Analyze the company or query: "${targetQuery}". 
Provide financial insights, valuation context, risks, and explain key terms clearly. Answer in a mix of clear English and Sinhala (සිංහලෙන්) where appropriate for local investors. Keep it structured and easy to read on mobile.`;

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'user',
            content: fullPrompt
          }
        ],
        temperature: 0.7
      })
    });

    const data = await groqResponse.json();

    if (!groqResponse.ok) {
      throw new Error(data.error?.message || 'Failed to communicate with Groq API');
    }

    const aiText = data.choices?.[0]?.message?.content || 'No response generated.';

    return res.status(200).json({ result: aiText });
  } catch (error) {
    console.error('Groq API Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate AI response' });
  }
}
