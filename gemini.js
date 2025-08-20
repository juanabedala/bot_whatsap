const fetch = require('node-fetch');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function askGemini(query, context) {
  const body = {
    contents: [{
      parts: [
        { text: `Contexto:\n${context}\n\nPregunta:\n${query}` }
      ]
    }]
  };

  const resp = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-latest:generateContent?key=" + GEMINI_API_KEY,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }
  );

  const data = await resp.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No tengo respuesta disponible.";
}

module.exports = { askGemini };
