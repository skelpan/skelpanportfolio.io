// Инициализация ассистента
document.addEventListener('DOMContentLoaded', function() {
  initAssistant();
});

function initAssistant() {
  const assistantBody = document.getElementById('assistant-body');
  const assistantInput = document.getElementById('assistant-input');
  const assistantSend = document.getElementById('assistant-send');
  const assistantClear = document.getElementById('assistant-clear');
  
  // Загрузка истории чата из localStorage
  loadChatHistory();
  
  // Обработчик отправки сообщения
  assistantSend.addEventListener('click', sendMessage);
  assistantInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
  
  // Очистка чата
  assistantClear.addEventListener('click', clearChat);
  
  function sendMessage() {
    const message = assistantInput.value.trim();
    if (!message) return;
    
    // Добавляем сообщение пользователя
    addMessage(message, 'user');
    
    // Очищаем поле ввода
    assistantInput.value = '';
    
    // Имитируем задержку ответа
    setTimeout(() => {
      // Генерируем ответ
      const response = generateResponse(message);
      addMessage(response, 'bot');
      
      // Сохраняем историю чата
      saveChatHistory();
      
      // Отправляем уведомление в Telegram о новом сообщении
      if (window.visitorTracker) {
        window.visitorTracker.sendAnonymousMessage(`Сообщение ассистенту: ${message}\nОтвет: ${response}`);
      }
    }, 1000);
  }
  
  function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('msg', sender);
    
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('msg-content');
    contentDiv.textContent = text;
    
    messageDiv.appendChild(contentDiv);
    assistantBody.appendChild(messageDiv);
    
    // Прокручиваем к последнему сообщению
    assistantBody.scrollTop = assistantBody.scrollHeight;
  }
  
  function generateResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Приветствие
    if (lowerMessage.includes('привет') || lowerMessage.includes('здравствуй') || lowerMessage.includes('hello')) {
      return 'Привет! Рад тебя видеть. Чем могу помочь?';
    }
    
    // О проектах
    if (lowerMessage.includes('проект') || lowerMessage.includes('работ')) {
      return 'У меня есть несколько проектов: Aniduo (подарок для владелицы студии), Podarok Sistr (поздравление сестре) и _Mr_Block (сайт для программиста). Все они доступны в разделе "Мои работы".';
    }
    
    // О навыках
    if (lowerMessage.includes('навык') || lowerMessage.includes('умение') || lowerMessage.includes('технологи')) {
      return 'Я работаю с HTML/CSS/JS, React, Flutter, а также создаю адаптивные и анимированные интерфейсы. В своих проектах я ценю искренность, креативность и вдохновение.';
    }
    
    // О музыке
    if (lowerMessage.includes('музык') || lowerMessage.includes('три дня дождя') || lowerMessage.includes('тринадцать карат')) {
      return 'Меня вдохновляет музыка групп "Три дня дождя" и "Тринадцать карат". Их глубина и эмоциональность находят отражение в моих работах.';
    }
    
    // Контакты
    if (lowerMessage.includes('контакт') || lowerMessage.includes('связаться') || lowerMessage.includes('телеграм')) {
      return 'Со мной можно связаться через Telegram: @skelpan31 или через форму обратной связи на сайте. Буду рад общению!';
    }
    
    // Благодарность
    if (lowerMessage.includes('спасибо') || lowerMessage.includes('благодар')) {
      return 'Всегда пожалуйста! Рад был помочь. Если есть еще вопросы - обращайся!';
    }
    
    // Стандартный ответ
    const randomResponses = [
      'Интересный вопрос! Могу рассказать подробнее о моих проектах или навыках.',
      'Не совсем понял вопрос. Можешь переформулировать?',
      'Это важная тема! Что именно тебя интересует?',
      'У меня есть информация об этом. Что конкретно тебе нужно узнать?',
      'Я еще учусь и могу не знать ответа на все вопросы. Спроси что-нибудь о моих проектах или опыте!'
    ];
    
    return randomResponses[Math.floor(Math.random() * randomResponses.length)];
  }
  
  function saveChatHistory() {
    const messages = [];
    document.querySelectorAll('.msg').forEach(msg => {
      messages.push({
        text: msg.querySelector('.msg-content').textContent,
        sender: msg.classList.contains('user') ? 'user' : 'bot'
      });
    });
    
    localStorage.setItem('assistantChat', JSON.stringify(messages));
  }
  
  function loadChatHistory() {
    const savedChat = localStorage.getItem('assistantChat');
    if (savedChat) {
      const messages = JSON.parse(savedChat);
      
      // Очищаем текущий чат (кроме приветственного сообщения)
      const welcomeMsg = assistantBody.querySelector('.msg');
      assistantBody.innerHTML = '';
      if (welcomeMsg) {
        assistantBody.appendChild(welcomeMsg);
      }
      
      // Восстанавливаем историю
      messages.forEach(msg => {
        if (msg.sender === 'user' || !welcomeMsg) {
          addMessage(msg.text, msg.sender);
        }
      });
    }
  }
  
  function clearChat() {
    // Сохраняем только приветственное сообщение
    const welcomeMsg = assistantBody.querySelector('.msg.bot');
    assistantBody.innerHTML = '';
    
    if (welcomeMsg) {
      assistantBody.appendChild(welcomeMsg);
    }
    
    // Очищаем localStorage
    localStorage.removeItem('assistantChat');
    
    // Показываем уведомление
    showNotification('История чата очищена', 'info');
  }
  
  function showNotification(message, type) {
    // Используем функцию уведомлений из основного скрипта
    if (typeof window.showNotification === 'function') {
      window.showNotification(message, type);
    }
  }
}