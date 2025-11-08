// assistant.js - для Vercel
document.addEventListener('DOMContentLoaded', function() {
  initAssistant();
});

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
    // Используем Vercel функцию
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        message: message 
      })
    });

    if (response.ok) {
      const data = await response.json();
      const responseText = data.text;
      typingMsg.querySelector('.msg-content').textContent = responseText;
      console.log('✅ AI Response:', responseText);
    } else {
      throw new Error('API request failed');
    }
    
  } catch (error) {
    console.error('API Error:', error);
    
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