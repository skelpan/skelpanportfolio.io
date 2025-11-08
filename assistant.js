document.addEventListener('DOMContentLoaded', function() {
  initAssistant();
});

const ASSISTANT_CONFIG = {
  apiUrl: '/api/chat',
  maxHistory: 10
};

let chatHistory = [];

async function getAIResponse(userMessage) {
  console.log('🔄 Sending request to:', ASSISTANT_CONFIG.apiUrl);
  
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

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('🤖 Response:', data);
    return data.text;
    
  } catch (error) {
    console.error('❌ API Error:', error);
    return 'Извините, произошла ошибка соединения. Напишите в Telegram @skelpan31!';
  }
}

function initAssistant() {
  const assistantBody = document.getElementById('assistant-body');
  const assistantInput = document.getElementById('assistant-input');
  const assistantSend = document.getElementById('assistant-send');
  const assistantClear = document.getElementById('assistant-clear');
  
  loadChatHistory();
  
  assistantSend.addEventListener('click', sendMessage);
  assistantInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') sendMessage();
  });
  
  assistantClear.addEventListener('click', clearChat);
  
  document.getElementById('assistant-toggle')?.addEventListener('click', function() {
    setTimeout(() => assistantInput.focus(), 300);
  });
  
  document.getElementById('mobile-assistant-toggle')?.addEventListener('click', function() {
    setTimeout(() => assistantInput.focus(), 300);
  });
}

async function sendMessage() {
  const assistantInput = document.getElementById('assistant-input');
  const assistantBody = document.getElementById('assistant-body');
  const message = assistantInput.value.trim();
  
  if (!message) return;
  
  addMessage(message, 'user');
  chatHistory.push({ role: 'user', content: message });
  assistantInput.value = '';
  
  const typingMsg = addMessage('Печатает...', 'bot', true);
  
  try {
    const responseText = await getAIResponse(message);
    typingMsg.querySelector('.msg-content').textContent = responseText;
    typingMsg.classList.remove('typing');
    chatHistory.push({ role: 'assistant', content: responseText });
    saveChatHistory();
  } catch (error) {
    console.error('Error:', error);
    typingMsg.querySelector('.msg-content').textContent = 'Ошибка соединения. Напишите в Telegram @skelpan31!';
    typingMsg.classList.remove('typing');
  }
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

function saveChatHistory() {
  try {
    const chatData = {
      messages: chatHistory,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('assistantChat', JSON.stringify(chatData));
  } catch (error) {
    console.error('Save error:', error);
  }
}

function loadChatHistory() {
  try {
    const savedChat = localStorage.getItem('assistantChat');
    const assistantBody = document.getElementById('assistant-body');
    
    if (savedChat) {
      const chatData = JSON.parse(savedChat);
      chatHistory = chatData.messages || [];
      
      const welcomeMsg = assistantBody.querySelector('.msg.bot');
      assistantBody.innerHTML = '';
      
      if (welcomeMsg) {
        assistantBody.appendChild(welcomeMsg);
      }
      
      chatHistory.forEach(msg => {
        if (msg.role === 'user' || !welcomeMsg) {
          addMessage(msg.content, msg.role === 'user' ? 'user' : 'bot');
        }
      });
    }
  } catch (error) {
    console.error('Load error:', error);
    chatHistory = [];
  }
}

function clearChat() {
  const assistantBody = document.getElementById('assistant-body');
  const welcomeMsg = assistantBody.querySelector('.msg.bot');
  assistantBody.innerHTML = '';
  
  if (welcomeMsg) {
    assistantBody.appendChild(welcomeMsg);
  }
  
  chatHistory = [];
  localStorage.removeItem('assistantChat');
}