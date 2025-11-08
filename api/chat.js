// api/chat.js
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // Разрешаем CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-05022752851e4776bdcbdb68aad8f0b6'
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `Ты помощник skelpan - веб-разработчика. Отвечай кратко на русском.`
          },
          {
            role: "user", 
            content: message
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    });

    const data = await response.json();
    const responseText = data.choices[0].message.content;

    res.json({ 
      text: responseText,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('API Error:', error);
    res.json({ 
      text: 'Привет! Я помощник skelpan! 🤖',
      error: true
    });
  }
};