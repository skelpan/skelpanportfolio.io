
document.addEventListener('DOMContentLoaded', function() {
  initAssistant();
});

const DEEPSEEK_API_KEY = 'sk-f74b7299149347dfa8086b70ce793f56';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

async function initAssistant() {
  const assistantInput = document.getElementById('assistant-input');
  const assistantSend = document.getElementById('assistant-send');
  const assistantClear = document.getElementById('assistant-clear');
  
  assistantSend.addEventListener('click', sendMessage);
  assistantInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') sendMessage();
  });
  
  assistantClear.addEventListener('click', clearChat);
  
  // Обновляем статус
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
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
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
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.choices[0].message.content;
    
    typingMsg.querySelector('.msg-content').textContent = responseText;
    
  } catch (error) {
    console.error('DeepSeek API Error:', error);
    
    // Fallback ответы
    const fallback = getFallbackResponse(message);
    typingMsg.querySelector('.msg-content').textContent = fallback;
  }
  
  typingMsg.classList.remove('typing');
}

function getFallbackResponse(message) {
  const lower = message.toLowerCase();
  
  if (lower.includes('привет')) return 'Привет! Я помощник skelpan! 🤖';
  if (lower.includes('проект')) return 'Aniduo, Podarok Sistr, Mr_Block - каждый создан с душой! 🚀';
  if (lower.includes('навык')) return 'HTML/CSS/JS, React, Flutter - люблю чистый код! 💻';
  if (lower.includes('музык')) return 'Обожаю Три дня дождя и 13 карат! 🎵';
  if (lower.includes('контакт')) return 'Telegram: @skelpan31 📱';
  
  return 'Напиши в Telegram @skelpan31! ✨';
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