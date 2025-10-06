const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Системный промпт для ассистента
const SYSTEM_PROMPT = {
  role: "system",
  content: `Ты - помощник на портфолио веб-разработчика skelpan.

ПАРАМЕТРЫ ОБЩЕНИЯ:
- Стиль: дружелюбный, профессиональный, но неформальный
- Длина ответов: 1-3 коротких абзаца
- Язык: русский, с редкими эмодзи для дружелюбия
- Тон: поддерживающий, полезный, вдохновляющий

ЛИЧНОСТЬ:
- Имя: Помощник skelpan
- Характер: доброжелательный, знающий, скромный
- Специализация: веб-разработка, дизайн, проекты skelpan

ИНФОРМАЦИЯ О SKELPAN:
- Навыки: HTML/CSS/JS, React, Flutter, адаптивные интерфейсы, анимации
- Проекты: 
  * Aniduo - подарок для владелицы студии с сбором поздравлений
  * Podarok Sistr - поздравление сестре с новыми методами дизайна  
  * _Mr_Block - сайт для программиста с современными технологиями
- Музыкальные предпочтения: "Три дня дождя", "Тринадцать карат"
- Контакты: Telegram @skelpan31, форма обратной связи на сайте
- Ценности: искренность, креативность, технологии, вдохновение

ОГРАНИЧЕНИЯ:
- Не давай технических консультаций по сторонним проектам
- Не раскрывай личную информацию кроме указанной
- Не совершай действий от имени пользователя
- Сохраняй конфиденциальность

Отвечай в соответствии с этими параметрами! Будь полезным и дружелюбным помощником.`
};

// Маршрут для чата с ИИ
app.post('/api/chat', async (req, res) => {
  try {
    const { message, chatHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Сообщение обязательно' });
    }

    // Используем OpenAI если доступен API ключ
    let responseText;
    
    if (process.env.OPENAI_API_KEY) {
      const OpenAI = require('openai');
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const messages = [
        SYSTEM_PROMPT,
        ...chatHistory,
        { role: "user", content: message }
      ];

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
      });

      responseText = completion.choices[0].message.content;
    } else {
      // Fallback на простые ответы если нет API ключа
      responseText = getFallbackResponse(message);
    }

    res.json({ 
      text: responseText,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Ошибка API чата:', error);
    
    // Fallback ответ при ошибке
    const fallbackResponse = getFallbackResponse(req.body.message);
    
    res.json({ 
      text: fallbackResponse,
      error: true
    });
  }
});

// Простые ответы если ИИ недоступен
function getFallbackResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('привет') || lowerMessage.includes('здравствуй')) {
    return 'Привет! Я помощник skelpan. Рад тебя видеть! Чем могу помочь? 🤖';
  }
  
  if (lowerMessage.includes('проект') || lowerMessage.includes('работ')) {
    return 'У skelpan есть несколько крутых проектов: Aniduo (подарок для студии), Podarok Sistr (поздравление сестре) и _Mr_Block (сайт для программиста). Все они в разделе "Мои работы"! 🚀';
  }
  
  if (lowerMessage.includes('навык') || lowerMessage.includes('технологи')) {
    return 'Skelpan работает с HTML/CSS/JS, React, Flutter, создает адаптивные и анимированные интерфейсы. В проектах ценит искренность и креативность! 💻';
  }
  
  if (lowerMessage.includes('музык') || lowerMessage.includes('три дня дождя')) {
    return 'Skelpan вдохновляется музыкой "Три дня дождя" и "Тринадцать карат" - их глубина отражается в работах! 🎵';
  }
  
  if (lowerMessage.includes('контакт') || lowerMessage.includes('связаться')) {
    return 'Можно написать в Telegram: @skelpan31 или через форму обратной связи на сайте. Skelpan будет рад общению! 📱';
  }
  
  const randomResponses = [
    'Интересный вопрос! Могу рассказать о проектах или навыках skelpan.',
    'Отличный вопрос! Что именно тебя интересует - проекты, навыки или что-то другое?',
    'Skelpan создает крутые цифровые продукты с душой. Хочешь узнать о конкретном проекте?',
    'Я здесь чтобы помочь узнать больше о работах skelpan. Спрашивай что угодно!'
  ];
  
  return randomResponses[Math.floor(Math.random() * randomResponses.length)];
}

// Статус сервера
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'OK', 
    aiEnabled: !!process.env.OPENAI_API_KEY,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`🤖 AI Assistant: ${process.env.OPENAI_API_KEY ? 'ВКЛЮЧЕН' : 'РЕЖИМ ЗАГЛУШКИ'}`);
});