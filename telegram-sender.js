// telegram-sender.js
// Добавьте этот код в свой сайт для отправки сообщений в Telegram

// Конфигурация (замените на свои данные)
const TELEGRAM_BOT_TOKEN = '8325858714:AAHsipAsY-Q_5SnR-pftMkhUSFYvq7lmhwE';
const TELEGRAM_CHAT_ID = '1860716243'; // Замените на свой chat_id

// Функция для отправки сообщения в Telegram
async function sendToTelegram(messageData) {
    try {
        // Формируем текст сообщения
        const text = `📧 Новое сообщение с сайта:\n\n👤 Имя: ${messageData.name}\n📧 Email: ${messageData.email}\n💬 Сообщение: ${messageData.message}\n⏰ Время: ${new Date().toLocaleString('ru-RU')}`;
        
        // Отправляем запрос к API Telegram
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: text,
                parse_mode: 'HTML'
            })
        });
        
        const data = await response.json();
        return data.ok;
    } catch (error) {
        console.error('Ошибка отправки в Telegram:', error);
        return false;
    }
}

// Обработчик формы
function setupTelegramFormHandler() {
    const contactForm = document.getElementById('contact-form');
    
    if (!contactForm) {
        console.warn('Форма с ID contact-form не найдена');
        return;
    }
    
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Получаем данные формы
        const formData = new FormData(contactForm);
        const messageData = {
            name: formData.get('name') || document.getElementById('name').value,
            email: formData.get('email') || document.getElementById('email').value,
            message: formData.get('message') || document.getElementById('message').value
        };
        
        // Визуальная обратная связь
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
        submitBtn.disabled = true;
        
        // Отправляем в Telegram
        const success = await sendToTelegram(messageData);
        
        if (success) {
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Отправлено!';
            submitBtn.style.background = 'var(--success)';
            
            // Очищаем форму через 2 секунды
            setTimeout(() => {
                contactForm.reset();
                submitBtn.innerHTML = originalText;
                submitBtn.style.background = '';
                submitBtn.disabled = false;
                
                // Показываем уведомление
                showNotification('Сообщение успешно отправлено!', 'success');
            }, 2000);
        } else {
            submitBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Ошибка';
            submitBtn.style.background = 'var(--error)';
            
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.style.background = '';
                submitBtn.disabled = false;
                
                showNotification('Ошибка отправки. Попробуйте еще раз.', 'error');
            }, 2000);
        }
    });
}

// Вспомогательная функция для показа уведомлений
function showNotification(message, type = 'info') {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
    `;
    
    // Стили для уведомления
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 400px;
    `;
    
    // Добавляем в документ
    document.body.appendChild(notification);
    
    // Удаляем через 5 секунд
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Стили для уведомлений (добавить в CSS)
const notificationStyles = `
@keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

.notification {
    font-family: 'Rajdhani', sans-serif;
    font-weight: 600;
}

.notification button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    margin-left: 10px;
}
`;

// Добавляем стили в документ
function addNotificationStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = notificationStyles;
    document.head.appendChild(styleElement);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    addNotificationStyles();
    setupTelegramFormHandler();
    
    // Добавляем инструкцию для пользователя (можно удалить после настройки)
    console.log('Telegram sender initialized. Make sure to set your 1860716243!');
    console.log('To get your chat_id:');
    console.log('1. Send a message to your bot');
    console.log('2. Visit: https://api.telegram.org/bot<8325858714:AAHsipAsY-Q_5SnR-pftMkhUSFYvq7lmhwE>/getUpdates');
    console.log('3. Find your chat_id in the response');
});