// Инициализация ассистента
document.addEventListener('DOMContentLoaded', function() {
  initAssistant();
});

// Конфигурация
const ASSISTANT_CONFIG = {
  apiUrl: 'https://portfolio-server-dobjqrbes-skelpans-projects.vercel.app/api/chat',
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
  console.log('🔄 Отправка запроса к ИИ...', ASSISTANT_CONFIG.apiUrl);
  
  try {
    const response = await fetch(ASSISTANT_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userMessage
      }),
    });

    console.log('📡 Статус ответа:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('🤖 Ответ ИИ получен:', data);
    return data.text;
    
  } catch (error) {
    console.error('❌ Ошибка получения ответа от ИИ:', error);
    return getFallbackAIResponse(userMessage);
  }
}

function getFallbackAIResponse(userMessage) {
  console.log('🔄 Используется резервный режим');
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('привет')) {
    return 'Привет! Я помощник skelpan. 🤖';
  }
  
  if (lowerMessage.includes('проект')) {
    return 'Проекты: Aniduo, Podarok Sistr, _Mr_Block. Смотри в разделе работ! 🚀';
  }
  
  if (lowerMessage.includes('навык')) {
    return 'HTML/CSS/JS, React, Flutter, адаптивные интерфейсы! 💻';
  }
  
  return 'Интересный вопрос! Лучше спроси о конкретных проектах или навыках skelpan. 😊';
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