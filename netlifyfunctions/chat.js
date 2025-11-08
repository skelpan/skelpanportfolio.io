module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('📨 Received:', message);

    // Используем DeepSeek API
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY || 'sk-f74b7299149347dfa8086b70ce793f56'}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `Ты помощник skelpan - веб-разработчика и дизайнера. 
            Отвечай кратко, дружелюбно, в стиле "Три дня дождя". 
            Рассказывай о проектах: 
            - Aniduo: подарок для владелицы студии с сбором поздравлений
            - Podarok Sistr: поздравление сестре с новыми методами дизайна  
            - _Mr_Block: сайт для программиста с современными технологиями
            Владею HTML/CSS/JS, React, Flutter.
            Люблю музыку "Три дня дождя" и "Тринадцать карат".
            Отвечай на русском языке. Будь креативным и вдохновляющим!`
          },
          {
            role: "user", 
            content: message
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.choices[0].message.content;
    
    console.log('✅ DeepSeek Response:', responseText);

    res.json({ 
      text: responseText,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ DeepSeek API Error:', error.message);
    
    // Fallback responses
    const lowerMessage = (req.body.message || '').toLowerCase();
    let fallbackResponse = 'Привет! Я помощник skelpan. Расскажу о проектах или навыках? 🤖';
    
    if (lowerMessage.includes('привет') || lowerMessage.includes('hello')) {
      fallbackResponse = 'Привет! Рад тебя видеть! Я skelpan - создаю цифровые миры с душой. 🌙';
    } else if (lowerMessage.includes('проект') || lowerMessage.includes('работ')) {
      fallbackResponse = 'Мои проекты: Aniduo (подарок для студии), Podarok Sistr (сестре), _Mr_Block (сайт программиста). Каждый создан с душой! 🚀';
    } else if (lowerMessage.includes('навык') || lowerMessage.includes('умение')) {
      fallbackResponse = 'Владею HTML/CSS/JS, React, Flutter. Люблю чистый код и креативные решения! Вдохновляюсь музыкой... 💻';
    } else if (lowerMessage.includes('музык') || lowerMessage.includes('тдд') || lowerMessage.includes('карат')) {
      fallbackResponse = 'Обожаю "Три дня дождя" и "Тринадцать карат"! Их глубина вдохновляет меня в работе. 🎵';
    }

    res.json({ 
      text: fallbackResponse,
      error: true,
      timestamp: new Date().toISOString()
    });
  }
};