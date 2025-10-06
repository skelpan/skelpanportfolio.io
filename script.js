// Основной скрипт с улучшенной функциональностью
document.addEventListener('DOMContentLoaded', function() {
  // Инициализация всех компонентов
  initNavigation();
  initSmoothScroll();
  initAnimations();
  initContactForm();
  initMobileMenu();
  initAssistantToggle();
  initParticles();
  initRainEffect();
  initScrollEffects();
  
  // Инициализация Telegram отправителя
  window.telegramSender = new TelegramSender('8325858714:AAHsipAsY-Q_5SnR-pftMkhUSFYvq7lmhwE', '1860716243');
  
  // Проверяем статус ассистента
  setTimeout(() => {
    checkAssistantStatus();
  }, 2000);
});

// Инициализация навигации
function initNavigation() {
  const header = document.querySelector('.header');
  
  window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

// Плавная прокрутка
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
        
        // Закрываем мобильное меню, если открыто
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenu.classList.contains('active')) {
          mobileMenu.classList.remove('active');
        }
      }
    });
  });
}

// Анимации при скролле
function initAnimations() {
  const animateOnScroll = function() {
    const elements = document.querySelectorAll('.card, .about-image, .info-item, .skill-item, .stat');
    
    elements.forEach(element => {
      const elementPosition = element.getBoundingClientRect().top;
      const screenPosition = window.innerHeight / 1.3;
      
      if (elementPosition < screenPosition) {
        element.classList.add('visible');
      }
    });
  };
  
  // Запускаем при загрузке и скролле
  window.addEventListener('load', animateOnScroll);
  window.addEventListener('scroll', animateOnScroll);
}

// Форма обратной связи
function initContactForm() {
  const contactForm = document.getElementById('contact-form');
  
  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const submitBtn = this.querySelector('.submit-btn');
      const originalText = submitBtn.innerHTML;
      
      // Получаем данные формы
      const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        message: document.getElementById('message').value,
        timestamp: new Date().toLocaleString('ru-RU')
      };
      
      // Показываем состояние загрузки
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
      submitBtn.disabled = true;
      
      try {
        // Отправляем данные в Telegram
        const success = await window.telegramSender.sendMessage(
          window.telegramSender.formatContactFormData(formData)
        );
        
        if (success) {
          // Показываем уведомление об успехе
          showNotification('Сообщение успешно отправлено! Я свяжусь с вами в ближайшее время.', 'success');
          
          // Очищаем форму
          contactForm.reset();
        } else {
          throw new Error('Ошибка отправки сообщения');
        }
      } catch (error) {
        // Показываем уведомление об ошибке
        showNotification('Произошла ошибка при отправке сообщения. Попробуйте еще раз.', 'error');
        console.error('Ошибка отправки формы:', error);
      } finally {
        // Восстанавливаем кнопку
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    });
  }
}

// Уведомления
function showNotification(message, type = 'info') {
  const notificationArea = document.getElementById('notification-area');
  if (!notificationArea) return;
  
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
      <span>${message}</span>
    </div>
  `;
  
  notificationArea.appendChild(notification);
  
  // Показываем уведомление
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Убираем через 5 секунд
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 5000);
}

// Мобильное меню
function initMobileMenu() {
  const menuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function() {
      mobileMenu.classList.toggle('active');
    });
    
    // Закрытие меню при клике на ссылку
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', function() {
        mobileMenu.classList.remove('active');
      });
    });
  }
}

// Ассистент
function initAssistantToggle() {
  const assistantToggle = document.getElementById('assistant-toggle');
  const mobileAssistantToggle = document.getElementById('mobile-assistant-toggle');
  const assistant = document.getElementById('assistant');
  
  if (assistantToggle && assistant) {
    assistantToggle.addEventListener('click', function() {
      assistant.classList.toggle('active');
    });
  }
  
  if (mobileAssistantToggle && assistant) {
    mobileAssistantToggle.addEventListener('click', function() {
      assistant.classList.toggle('active');
      document.getElementById('mobile-menu').classList.remove('active');
    });
  }
  
  // Закрытие ассистента
  const assistantClose = document.getElementById('assistant-close');
  if (assistantClose) {
    assistantClose.addEventListener('click', function() {
      assistant.classList.remove('active');
    });
  }
}

// Частицы
function initParticles() {
  const particlesContainer = document.getElementById('particles');
  if (!particlesContainer) return;
  
  const particleCount = 30;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    
    // Случайные размеры и позиции
    const size = Math.random() * 20 + 5;
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    const delay = Math.random() * 20;
    
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${posX}%`;
    particle.style.top = `${posY}%`;
    particle.style.animationDelay = `${delay}s`;
    particle.style.opacity = Math.random() * 0.2 + 0.1;
    
    particlesContainer.appendChild(particle);
  }
}

// Эффект дождя
function initRainEffect() {
  const rainContainer = document.getElementById('rain-container');
  if (!rainContainer) return;
  
  const raindropCount = 100;
  
  for (let i = 0; i < raindropCount; i++) {
    const raindrop = document.createElement('div');
    raindrop.classList.add('drop');
    
    // Случайные параметры
    const left = Math.random() * 100;
    const height = Math.random() * 20 + 10;
    const delay = Math.random() * 5;
    const duration = Math.random() * 1 + 0.5;
    
    raindrop.style.left = `${left}%`;
    raindrop.style.height = `${height}px`;
    raindrop.style.animationDelay = `${delay}s`;
    raindrop.style.animationDuration = `${duration}s`;
    
    rainContainer.appendChild(raindrop);
  }
}

// Эффекты при скролле
function initScrollEffects() {
  const visualElements = document.querySelectorAll('.visual-element');
  
  window.addEventListener('scroll', function() {
    const scrollY = window.scrollY;
    
    // Параллакс эффект для визуальных элементов
    visualElements.forEach((element, index) => {
      const speed = 0.05 * (index + 1);
      element.style.transform = `translateY(${scrollY * speed}px)`;
    });
  });
}



// Проверка статуса ассистента
async function checkAssistantStatus() {
  try {
    const response = await fetch('https://portfolio-server-dobjqrbes-skelpans-projects.vercel.app/api/status');
    const data = await response.json();
    console.log(`🤖 Ассистент: ${data.aiEnabled ? 'ИИ активирован' : 'Режим заглушки'}`);
    return data;
  } catch (error) {
    console.log('🤖 Ассистент: Сервер недоступен, используется резервный режим');
    return { aiEnabled: false, status: 'offline' };
  }
}

// Утилита для форматирования дат
function formatDate(date) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString('ru-RU', options);
}

// Утилита для обработки ошибок
function handleError(error, context = '') {
  console.error(`Ошибка ${context}:`, error);
  showNotification(`Произошла ошибка ${context}. Попробуйте еще раз.`, 'error');
}