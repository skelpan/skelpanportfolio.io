// assistant.js - бесплатные AI API
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
    assistantHeader.innerHTML = '<i class="fas fa-robot"></i> Помощник (AI)';
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
    // Пробуем бесплатный AI API
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyCH9e4VXcVoR1WsiJ7f7IqDnQV7Vr0o7eA', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Ты помощник skelpan - веб-разработчика. Отвечай кратко на русском.
            
            О проектах:
            - Aniduo: подарок для студии
            - Podarok Sistr: поздравление сестре  
            - Mr_Block: сайт программисту
            
            Навыки: HTML/CSS/JS, React, Flutter
            Музыка: Три дня дождя, Тринадцать карат
            
            Вопрос: ${message}
            
            Ответь кратко (1-2 предложения):`
          }]
        }]
      })
    });

    if (response.ok) {
      const data = await response.json();
      const responseText = data.candidates[0].content.parts[0].text;
      typingMsg.querySelector('.msg-content').textContent = responseText;
    } else {
      throw new Error('Free API failed');
    }
    
  } catch (error) {
    console.error('AI Error:', error);
    
    // Очень умные fallback ответы
    const fallback = getSmartResponse(message);
    typingMsg.querySelector('.msg-content').textContent = fallback;
  }
  
  typingMsg.classList.remove('typing');
}

function getSmartResponse(message) {
  const lower = message.toLowerCase();
  
  // Глубокие ответы в стиле ТДД
  const responses = {
    'привет': 'Привет... Я эхо skelpan в цифровом пространстве. Чувствую, ты пришёл не просто так... 🌙',
    'проект': 'Aniduo - подарок студии, где поздравления стали звёздами... Podarok Sistr - сестре, в каждом пикселе - забота... Mr_Block - код как поэзия... 📖',
    'навык': 'HTML/CSS/JS - ноты, React/Flutter - инструменты... Но настоящая магия - в чувствах, которые я вкладываю в интерфейсы... 💻',
    'музык': 'Три дня дождя... Их тексты - как строчки из моего дневника. Тринадцать карат - глубина, которая вдохновляет... 🎵',
    'опыт': 'Год в разработке... 15 проектов... Но важнее - души, тронутые моими работами... 🌟',
    'контакт': 'Telegram: @skelpan31... Пиши... Иногда одно сообщение может изменить всё... 📱',
    'цен': 'Стоимость... Как ценность чувств в песне... Давай обсудим в Telegram @skelpan31 💫',
    'default': 'Иногда слова бессильны... Лучше напиши в Telegram @skelpan31, обсудим твой проект... ☕'
  };
  
  if (lower.includes('привет')) return responses.привет;
  if (lower.includes('проект') || lower.includes('работ')) return responses.проект;
  if (lower.includes('навык') || lower.includes('технолог')) return responses.навык;
  if (lower.includes('музык') || lower.includes('тдд') || lower.includes('карат')) return responses.музык;
  if (lower.includes('опыт') || lower.includes('стаж')) return responses.опыт;
  if (lower.includes('контакт') || lower.includes('телеграм')) return responses.контакт;
  if (lower.includes('цен') || lower.includes('стоим')) return responses.цен;
  
  return responses.default;
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