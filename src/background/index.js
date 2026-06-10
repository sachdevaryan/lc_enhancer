chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ANALYSE_COMPLEXITY') {
    handleAnalysis(message.code).then(sendResponse);
    return true; // keep message channel open for async response
  }
});

async function handleAnalysis(code) {
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 300,
        temperature: 0.1,
        messages: [
          {
            role: 'system',
            content: `You are a code complexity analyser. Always respond with valid JSON only, no markdown, no explanation outside JSON.
Return exactly: {"time": "O(...)", "space": "O(...)", "explanation": "2-3 sentence plain English explanation"}`
          },
          {
            role: 'user',
            content: `Analyse the time and space complexity of this code:\n\n${code}`
          }
        ]
      })
    });

    if (!res.ok) {
      const err = await res.json();
      return { error: err.error?.message || 'Groq API error' };
    }

    const data = await res.json();
    const text = data.choices[0].message.content.trim();
    const parsed = JSON.parse(text);
    return parsed;
  } catch (err) {
    return { error: err.message };
  }
}