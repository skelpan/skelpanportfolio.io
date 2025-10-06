// Инициализация ассистента
document.addEventListener('DOMContentLoaded', function() {
  initAssistant();
});

// Конфигурация
const ASSISTANT_CONFIG = {
  apiUrl: 'http://localhost:3000/api/chat', // Измените на ваш URL в продакшене
  maxHistory: 10,
  fallbackResponses: [
    'Извините, сейчас не могу ответить. Напишите напрямую в Telegram @skelpan31!',
    'Попробуйте позже или свяжитесь с skelpan через форму на сайте.',
    'Связь временно недоступна. Skelpan будет рад вашему сообщению в Telegram!'
  ]
};

// Глобальные переменные
let chatHistory = [];

async function getAIResponse(userMessage) {
  try {
    const response = await fetch(ASSISTANT_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userMessage,
        chatHistory: chatHistory.slice(-ASSISTANT_CONFIG.maxHistory)
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.text;
    
  } catch (error) {
    console.error('Ошибка получения ответа от ИИ:', error);
    
    // Пробуем альтернативный endpoint если основной не работает
    if (ASSISTANT_CONFIG.apiUrl.includes('localhost')) {
      return getFallbackAIResponse(userMessage);
    }
    
    throw error;
  }
}

// Резервный ИИ через внешний сервис (можно удалить если не нужно)
async function getFallbackAIResponse(userMessage) {
  try {
    // Простая заглушка - в реальном проекте можно подключить другой API
    const responses = {
      'привет': 'Привет! Я помощник skelpan. 🤖 Рад общению!',
      'проект': 'У skelpan крутые проекты: Aniduo, Podarok Sistr и _Mr_Block! Загляни в раздел работ. 🚀',
      'навык': 'Skelpan владеет HTML/CSS/JS, React, Flutter, создает адаптивные интерфейсы с анимациями! 💻',
      'контакт': 'Пиши в Telegram @skelpan31 или через форму на сайте! 📱',
      'музыка': 'Вдохновляется "Три дня дождя" и "Тринадцать карат" - это чувствуется в работах! 🎵'
    };
    
    const lowerMessage = userMessage.toLowerCase();
    for (const [key, response] of Object.entries(responses)) {
      if (lowerMessage.includes(key)) {
        return response;
      }
    }
    
    return 'Интересный вопрос! Лучше спроси о конкретных проектах или навыках skelpan. 😊';
    
  } catch (error) {
    return ASSISTANT_CONFIG.fallbackResponses[
      Math.floor(Math.random() * ASSISTANT_CONFIG.fallbackResponses.length)
    ];
  }
}

function initAssistant() {
  const assistantBody = document.getElementById('assistant-body');
  const assistantInput = document.getElementById('assistant-input');
  const assistantSend = document.getElementById('assistant-send');
  const assistantClear = document.getElementById('assistant-clear');
  
  // Загрузка истории чата
  loadChatHistory();
  
  // Обработчики событий
  assistantSend.addEventListener('click', sendMessage);
  assistantInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
  
  assistantClear.addEventListener('click', clearChat);
  
  // Автофокус на инпуте при открытии
  document.getElementById('assistant-toggle')?.addEventListener('click', function() {
    setTimeout(() => {
      assistantInput.focus();
    }, 300);
  });
  
  document.getElementById('mobile-assistant-toggle')?.addEventListener('click', function() {
    setTimeout(() => {
      assistantInput.focus();
    }, 300);
  });
}

async function sendMessage() {
  const assistantInput = document.getElementById('assistant-input');
  const assistantBody = document.getElementById('assistant-body');
  const message = assistantInput.value.trim();
  
  if (!message) return;
  
  // Добавляем сообщение пользователя
  addMessage(message, 'user');
  chatHistory.push({ role: 'user', content: message });
  
  // Очищаем инпут
  assistantInput.value = '';
  
  // Показываем индикатор печатания
  const typingMsg = addMessage('Печатает...', 'bot', true);
  
  try {
    // Получаем ответ от ИИ
    const responseText = await getAIResponse(message);
    
    // Обновляем сообщение с ответом
    typingMsg.querySelector('.msg-content').textContent = responseText;
    typingMsg.classList.remove('typing');
    
    // Сохраняем в историю
    chatHistory.push({ role: 'assistant', content: responseText });
    saveChatHistory();
    
    // Логируем в Telegram (опционально)
    if (window.visitorTracker) {
      window.visitorTracker.sendAnonymousMessage(
        `💬 Диалог с ассистентом:\nВопрос: ${message}\nОтвет: ${responseText.substring(0, 100)}...`
      );
    }
    
  } catch (error) {
    console.error('Ошибка отправки сообщения:', error);
    
    // Показываем сообщение об ошибке
    typingMsg.querySelector('.msg-content').textContent = 
      ASSISTANT_CONFIG.fallbackResponses[0];
    typingMsg.classList.remove('typing');
    
    // Сохраняем ошибку в историю
    chatHistory.push({ 
      role: 'assistant', 
      content: ASSISTANT_CONFIG.fallbackResponses[0] 
    });
    saveChatHistory();
  }
}

function addMessage(text, sender, isTyping = false) {
  const assistantBody = document.getElementById('assistant-body');
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('msg', sender);
  
  if (isTyping) {
    messageDiv.classList.add('typing');
  }
  
  const contentDiv = document.createElement('div');
  contentDiv.classList.add('msg-content');
  contentDiv.textContent = text;
  
  messageDiv.appendChild(contentDiv);
  assistantBody.appendChild(messageDiv);
  
  // Прокручиваем к последнему сообщению
  assistantBody.scrollTop = assistantBody.scrollHeight;
  
  return messageDiv;
}

function saveChatHistory() {
  try {
    const chatData = {
      messages: chatHistory,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    localStorage.setItem('assistantChat', JSON.stringify(chatData));
  } catch (error) {
    console.error('Ошибка сохранения истории:', error);
  }
}

function loadChatHistory() {
  try {
    const savedChat = localStorage.getItem('assistantChat');
    const assistantBody = document.getElementById('assistant-body');
    
    if (savedChat) {
      const chatData = JSON.parse(savedChat);
      chatHistory = chatData.messages || [];
      
      // Очищаем чат (кроме приветственного сообщения)
      const welcomeMsg = assistantBody.querySelector('.msg.bot');
      assistantBody.innerHTML = '';
      
      if (welcomeMsg) {
        assistantBody.appendChild(welcomeMsg);
      }
      
      // Восстанавливаем историю (пропускаем приветственное если уже есть)
      chatHistory.forEach(msg => {
        if (msg.role === 'user' || !welcomeMsg) {
          addMessage(msg.content, msg.role === 'user' ? 'user' : 'bot');
        }
      });
    }
  } catch (error) {
    console.error('Ошибка загрузки истории:', error);
    chatHistory = [];
  }
}

function clearChat() {
  const assistantBody = document.getElementById('assistant-body');
  
  // Оставляем только приветственное сообщение
  const welcomeMsg = assistantBody.querySelector('.msg.bot');
  assistantBody.innerHTML = '';
  
  if (welcomeMsg) {
    assistantBody.appendChild(welcomeMsg);
  }
  
  // Очищаем историю
  chatHistory = [];
  localStorage.removeItem('assistantChat');
  
  // Показываем уведомление
  if (typeof window.showNotification === 'function') {
    window.showNotification('История чата очищена', 'info');
  }
}

// Экспортируем функции для глобального использования
window.AssistantManager = {
  sendMessage,
  clearChat,
  loadChatHistory,
  saveChatHistory
};