// assistant.js - DeepSeek API с CORS прокси
document.addEventListener('DOMContentLoaded', function() {
  initAssistant();
});

const DEEPSEEK_API_KEY = 'sk-05022752851e4776bdcbdb68aad8f0b6';

async function initAssistant() {
  const assistantInput = document.getElementById('assistant-input');
  const assistantSend = document.getElementById('assistant-send');
  const assistantClear = document.getElementById('assistant-clear');
  
  assistantSend.addEventListener('click', sendMessage);
  assistantInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') sendMessage();
  });
  
  assistantClear.addEventListener('click', clearChat);
  
  const assistantHeader = document.querySelector('.assistant-header span');
  if (assistantHeader) {
    assistantHeader.innerHTML = '<i class="fas fa-robot"></i> Помощник (DeepSeek)';
  }
}

async function sendMessage() {
  const assistantInput = document.getElementById('assistant-input');
  const message = assistantInput.value.trim();
  
  if (!message) return;
  
  addMessage(message, 'user');
  assistantInput.value = '';
  
  const typingMsg = addMessage('Думаю...', 'bot', true);
  
  try {
    // Используем CORS прокси для обхода ограничений
    const proxyUrl = 'https://api.corsproxy.io/';
    const targetUrl = 'https://api.deepseek.com/chat/completions';
    
    const response = await fetch(`${proxyUrl}?${encodeURIComponent(targetUrl)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'X-Requested-With': 'XMLHttpRequest'
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
            Отвечай на русском языке. Будь креативным и вдохновляющим!
            Максимум 2-3 предложения в ответе.`
          },
          {
            role: "user", 
            content: message
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
        stream: false
      })
    });

    if (response.ok) {
      const data = await response.json();
      const responseText = data.choices[0].message.content;
      typingMsg.querySelector('.msg-content').textContent = responseText;
      console.log('✅ DeepSeek Response:', responseText);
    } else {
      console.error('❌ API Error:', response.status);
      throw new Error(`API error: ${response.status}`);
    }
    
  } catch (error) {
    console.error('DeepSeek API Error:', error);
    
    // Умные fallback ответы
    const fallback = getSmartResponse(message);
    typingMsg.querySelector('.msg-content').textContent = fallback;
  }
  
  typingMsg.classList.remove('typing');
}

function getSmartResponse(message) {
  const lower = message.toLowerCase();
  
  if (lower.includes('привет') || lower.includes('hello')) {
    return 'Привет! Я помощник skelpan. Расскажу о проектах или просто пообщаемся? 🤖';
  }
  
  if (lower.includes('проект') || lower.includes('работ')) {
    return 'Aniduo - подарок студии, Podarok Sistr - сестре, Mr_Block - программисту. Каждый проект создан с душой! 🚀';
  }
  
  if (lower.includes('навык') || lower.includes('технолог')) {
    return 'Владею HTML/CSS/JS, React, Flutter. Люблю чистый код и креативные решения! 💻';
  }
  
  if (lower.includes('музык') || lower.includes('тдд') || lower.includes('карат')) {
    return 'Обожаю Три дня дождя и 13 карат! Их музыка вдохновляет меня в работе 🎵';
  }
  
  if (lower.includes('контакт') || lower.includes('телеграм')) {
    return 'Telegram: @skelpan31 - пиши, отвечу быстро! 📱';
  }
  
  if (lower.includes('опыт') || lower.includes('стаж')) {
    return 'Более 1 года в веб-разработке, 15+ завершенных проектов! 🌟';
  }
  
  return 'Интересный вопрос! Напиши в Telegram @skelpan31 - обсудим подробнее ✨';
}

function addMessage(text, sender, isTyping = false) {
  const assistantBody = document.getElementById('assistant-body');
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('msg', sender);
  if (isTyping) messageDiv.classList.add('typing');
  
  const contentDiv = document.createElement('div');
  contentDiv.classList.add('msg-content');
  contentDiv.textContent = text;
  
  messageDiv.appendChild(contentDiv);
  assistantBody.appendChild(messageDiv);
  assistantBody.scrollTop = assistantBody.scrollHeight;
  
  return messageDiv;
}

function clearChat() {
  const assistantBody = document.getElementById('assistant-body');
  const welcomeMsg = assistantBody.querySelector('.msg.bot');
  assistantBody.innerHTML = '';
  if (welcomeMsg) assistantBody.appendChild(welcomeMsg);
}