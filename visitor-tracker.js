// visitor-tracker.js
// Отслеживание посетителей сайта с отправкой в Telegram

// Конфигурация (замените на свои данные)
const VISITOR_BOT_TOKEN = '8325858714:AAHsipAsY-Q_5SnR-pftMkhUSFYvq7lmhwE';
const VISITOR_CHAT_ID = '1860716243'; // Замените на свой chat_id

// Функция для получения информации о посетителе
async function getVisitorInfo() {
    try {
        // Получаем IP-адрес
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        const ip = ipData.ip;
        
        // Получаем информацию о местоположении по IP
        let locationInfo = 'Не удалось определить';
        try {
            const locationResponse = await fetch(`https://ipapi.co/${ip}/json/`);
            const locationData = await locationResponse.json();
            if (!locationData.error) {
                locationInfo = `${locationData.city}, ${locationData.region}, ${locationData.country_name}`;
            }
        } catch (e) {
            console.error('Ошибка получения местоположения:', e);
        }
        
        // Информация о браузере и устройстве
        const browserInfo = navigator.userAgent;
        const language = navigator.language;
        const screenResolution = `${window.screen.width}x${window.screen.height}`;
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const currentTime = new Date().toLocaleString('ru-RU');
        
        // Информация о посещенных страницах (если доступно)
        const referrer = document.referrer || 'Прямой заход';
        
        return {
            ip,
            location: locationInfo,
            browser: browserInfo,
            language,
            screen: screenResolution,
            timezone,
            time: currentTime,
            referrer,
            url: window.location.href
        };
    } catch (error) {
        console.error('Ошибка получения информации о посетителе:', error);
        return null;
    }
}

// Функция для отправки информации о посетителе в Telegram
async function sendVisitorInfoToTelegram(visitorInfo) {
    if (!visitorInfo) return false;
    
    try {
        // Формируем текст сообщения
        const text = `👀 Новый посетитель на сайте!\n\n📊 Информация:\n├─ IP: ${visitorInfo.ip}\n├─ Местоположение: ${visitorInfo.location}\n├─ Время: ${visitorInfo.time}\n├─ Браузер: ${visitorInfo.browser}\n├─ Язык: ${visitorInfo.language}\n├─ Разрешение: ${visitorInfo.screen}\n├─ Часовой пояс: ${visitorInfo.timezone}\n├─ Источник: ${visitorInfo.referrer}\n└─ Страница: ${visitorInfo.url}`;
        
        // Отправляем запрос к API Telegram
        const response = await fetch(`https://api.telegram.org/bot${VISITOR_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: VISITOR_CHAT_ID,
                text: text,
                parse_mode: 'HTML'
            })
        });
        
        const data = await response.json();
        return data.ok;
    } catch (error) {
        console.error('Ошибка отправки информации о посетителе:', error);
        return false;
    }
}

// Функция для отслеживания действий пользователя
function trackUserActivity() {
    let lastActivity = Date.now();
    
    // События, которые считаются активностью
    const activityEvents = ['mousemove', 'keypress', 'scroll', 'click', 'touchstart'];
    
    activityEvents.forEach(event => {
        document.addEventListener(event, () => {
            lastActivity = Date.now();
        });
    });
    
    // Проверяем активность каждые 30 секунд
    setInterval(() => {
        const inactiveTime = (Date.now() - lastActivity) / 1000; // в секундах
        if (inactiveTime > 60) { // Если неактивен более 60 секунд
            console.log('Пользователь неактивен более 60 секунд');
        }
    }, 30000);
}

// Функция для отслеживания времени на сайте
function trackTimeOnSite() {
    const startTime = Date.now();
    
    window.addEventListener('beforeunload', () => {
        const endTime = Date.now();
        const timeSpent = Math.round((endTime - startTime) / 1000); // в секундах
        
        // Отправляем информацию о времени, проведенном на сайте
        sendTimeSpentInfo(timeSpent);
    });
}

// Функция для отправки информации о времени, проведенном на сайте
async function sendTimeSpentInfo(timeSpent) {
    try {
        const visitorInfo = await getVisitorInfo();
        if (!visitorInfo) return;
        
        const text = `⏱ Пользователь провел на сайте: ${timeSpent} секунд\n\n📊 Дополнительная информация:\n├─ IP: ${visitorInfo.ip}\n├─ Страница: ${visitorInfo.url}\n└─ Время выхода: ${new Date().toLocaleString('ru-RU')}`;
        
        await fetch(`https://api.telegram.org/bot${VISITOR_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: VISITOR_CHAT_ID,
                text: text,
                parse_mode: 'HTML'
            })
        });
    } catch (error) {
        console.error('Ошибка отправки информации о времени:', error);
    }
}

// Основная функция инициализации отслеживания
async function initVisitorTracking() {
    // Проверяем, не отправляли ли мы уже информацию об этом посещении
    if (!sessionStorage.getItem('visitorTracked')) {
        const visitorInfo = await getVisitorInfo();
        if (visitorInfo) {
            const success = await sendVisitorInfoToTelegram(visitorInfo);
            if (success) {
                sessionStorage.setItem('visitorTracked', 'true');
            }
        }
    }
    
    // Запускаем отслеживание активности
    trackUserActivity();
    
    // Запускаем отслеживание времени на сайте
    trackTimeOnSite();
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Небольшая задержка, чтобы не замедлять загрузку страницы
    setTimeout(initVisitorTracking, 2000);
});

// Отслеживание изменения страницы (для SPA)
let currentUrl = window.location.href;
setInterval(() => {
    if (currentUrl !== window.location.href) {
        currentUrl = window.location.href;
        
        // Отправляем информацию о переходе на новую страницу
        getVisitorInfo().then(visitorInfo => {
            if (visitorInfo) {
                const text = `🔁 Переход на новую страницу:\n\n📄 Страница: ${visitorInfo.url}\n👤 Пользователь: ${visitorInfo.ip}\n⏰ Время: ${new Date().toLocaleString('ru-RU')}`;
                
                fetch(`https://api.telegram.org/bot${VISITOR_BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        chat_id: VISITOR_CHAT_ID,
                        text: text,
                        parse_mode: 'HTML'
                    })
                });
            }
        });
    }
}, 1000);