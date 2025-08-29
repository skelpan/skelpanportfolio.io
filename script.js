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

// Mobile menu toggle
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuToggle && mobileMenu) {
  mobileMenuToggle.addEventListener('click', () => {
    mobileMenu.style.display = mobileMenu.style.display === 'flex' ? 'none' : 'flex';
  });
}

// Close mobile menu when clicking on a link
document.querySelectorAll('#mobile-menu a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.style.display = 'none';
  });
});

// Create floating particles
function createParticles() {
  const particlesContainer = document.getElementById('particles');
  if (!particlesContainer) return;
  
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
      
      // Close mobile menu
      if (mobileMenu) {
        mobileMenu.style.display = 'none';
      }
    }
  });
});

// Intersection Observer for section animations
const sections = document.querySelectorAll('.section');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, {
  threshold: 0.1
});

sections.forEach(section => {
  observer.observe(section);
});

// Form submission
const contactForm = document.getElementById("contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
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
}

// Touch device detection
function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// Add touch device class
if (isTouchDevice()) {
  document.body.classList.add('touch-device');
}

// Инициализация анонимных сообщений
function initAnonymousMessage() {
  const modal = document.getElementById('anonymous-modal');
  const messageInput = document.getElementById('anonymous-message');
  const sendBtn = document.getElementById('send-anonymous');
  const closeBtns = document.querySelectorAll('.modal-close');
  const openBtn = document.getElementById('anonymous-message-btn');
  
  if (!modal || !sendBtn || !openBtn) return;
  
  // Открытие модального окна
  openBtn.addEventListener('click', () => {
    modal.style.display = 'flex';
    if (messageInput) messageInput.focus();
  });
  
  // Закрытие модального окна
  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modal.style.display = 'none';
      if (messageInput) messageInput.value = '';
    });
  });
  
  // Закрытие при клике вне модального окна
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
      if (messageInput) messageInput.value = '';
    }
  });
  
  // Отправка сообщения
  sendBtn.addEventListener('click', async () => {
    const message = messageInput ? messageInput.value.trim() : '';
    if (!message) {
      alert('Пожалуйста, введите сообщение');
      return;
    }
    
    const originalText = sendBtn.innerHTML;
    sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
    sendBtn.disabled = true;
    
    try {
      // Используем функцию из visitor-tracker.js
      if (window.visitorTracker && window.visitorTracker.sendAnonymousMessage) {
        const success = await window.visitorTracker.sendAnonymousMessage(message);
        
        if (success) {
          alert('Сообщение отправлено анонимно!');
          modal.style.display = 'none';
          if (messageInput) messageInput.value = '';
        } else {
          alert('Ошибка отправки сообщения. Попробуйте еще раз.');
        }
      } else {
        alert('Система отправки сообщений не загружена');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Произошла ошибка при отправке сообщения.');
    } finally {
      sendBtn.innerHTML = originalText;
      sendBtn.disabled = false;
    }
  });
  
  // Отправка по Enter
  if (messageInput) {
    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendBtn.click();
      }
    });
  }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
  initAnonymousMessage();
  console.log('Script initialized successfully');
});