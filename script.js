// Current year in footer
document.getElementById("year").textContent = new Date().getFullYear();

// Header scroll effect
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// Assistant toggle
const assistant = document.getElementById("assistant");
const assistantBody = document.getElementById("assistant-body");
const assistantInput = document.getElementById("assistant-input");
const sendBtn = document.getElementById("assistant-send");

document.getElementById("assistant-toggle").onclick = () => {
  assistant.style.display = "flex";
};
document.getElementById("assistant-close").onclick = () => {
  assistant.style.display = "none";
};

// Simple chat
sendBtn.onclick = sendMessage;
assistantInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  const text = assistantInput.value.trim();
  if (!text) return;
  
  appendMessage(text, "user");
  assistantInput.value = "";
  
  // Simulate typing indicator
  const typingIndicator = document.createElement("div");
  typingIndicator.className = "msg bot";
  typingIndicator.innerHTML = '<i class="fas fa-ellipsis-h"></i>';
  assistantBody.appendChild(typingIndicator);
  assistantBody.scrollTop = assistantBody.scrollHeight;
  
  setTimeout(() => {
    assistantBody.removeChild(typingIndicator);
    
    const responses = [
      "Отличный вопрос! Я могу рассказать больше о моих проектах или технологиях, которые я использую.",
      "Спасибо за ваш интерес! Как я могу помочь вам сегодня?",
      "Я пока учусь, но уже могу ответить на многие вопросы о моих работах.",
      "Для быстрого ответа вы можете посмотреть мое портфолио или связаться со мной через форму контактов."
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    appendMessage(randomResponse, "bot");
  }, 1000 + Math.random() * 2000);
}

function appendMessage(text, type) {
  const div = document.createElement("div");
  div.className = `msg ${type}`;
  div.textContent = text;
  assistantBody.appendChild(div);
  assistantBody.scrollTop = assistantBody.scrollHeight;
}

// Form submission
document.getElementById("contact-form").addEventListener("submit", (e) => {
  e.preventDefault();
  
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  
  // Change button to loading state
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
  submitBtn.disabled = true;
  
  // Simulate form submission
  setTimeout(() => {
    submitBtn.innerHTML = '<i class="fas fa-check"></i> Отправлено!';
    submitBtn.style.background = 'var(--success)';
    
    // Reset form
    setTimeout(() => {
      form.reset();
      submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Отправить сообщение';
      submitBtn.style.background = '';
      submitBtn.disabled = false;
    }, 2000);
  }, 1500);
});

// Create floating particles
function createParticles() {
  const particlesContainer = document.getElementById('particles');
  const particleCount = 30;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    
    // Random size between 1px and 3px
    const size = Math.random() * 2 + 1;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    
    // Random position
    particle.style.left = `${Math.random() * 100}vw`;
    particle.style.top = `${Math.random() * 100}vh`;
    
    // Random animation duration between 10s and 20s
    const duration = Math.random() * 10 + 10;
    particle.style.animationDuration = `${duration}s`;
    
    // Random delay
    particle.style.animationDelay = `${Math.random() * 5}s`;
    
    particlesContainer.appendChild(particle);
  }
}

createParticles();

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      window.scrollTo({
        top: targetElement.offsetTop - 80,
        behavior: 'smooth'
      });
      
      // Close assistant if open
      if (assistant.style.display === 'flex') {
        assistant.style.display = 'none';
      }
    }
  });
}




);