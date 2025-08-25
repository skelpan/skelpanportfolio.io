// visitor-tracker.js
// Расширенное отслеживание посетителей с отправкой в Telegram

const VISITOR_BOT_TOKEN = '8325858714:AAHsipAsY-Q_5SnR-pftMkhUSFYvq7lmhwE';
const VISITOR_CHAT_ID = '1860716243';

// Глобальные переменные
let visitorSessionId = generateSessionId();
let startTime = Date.now();
let currentPage = window.location.href;

// Генерация ID сессии
function generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

// Получение расширенной информации
async function getEnhancedVisitorInfo() {
    try {
        // Получаем IP
        const ip = await getIPAddress();
        
        // Получаем информацию о местоположении
        const locationInfo = await getEnhancedLocationInfo(ip);
        
        // Анализируем реферер
        const referrerInfo = analyzeReferrer();
        
        // Получаем информацию об устройстве
        const deviceInfo = getDeviceInfo();
        
        // Получаем информацию о браузере
        const browserInfo = getBrowserInfo();
        
        // Проверяем, является ли посетитель ботом
        const isBot = checkIfBot();
        
        // Получаем информацию о сети
        const networkInfo = await getNetworkInfo();
        
        return {
            sessionId: visitorSessionId,
            ip: ip,
            location: locationInfo,
            referrer: referrerInfo,
            device: deviceInfo,
            browser: browserInfo,
            network: networkInfo,
            page: {
                url: window.location.href,
                title: document.title,
                language: navigator.language,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                timezoneOffset: new Date().getTimezoneOffset(),
                localTime: new Date().toLocaleString('ru-RU')
            },
            isBot: isBot,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('Ошибка получения информации о посетителе:', error);
        return null;
    }
}

// Получение IP-адреса
async function getIPAddress() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        try {
            const response = await fetch('https://ipinfo.io/json');
            const data = await response.json();
            return data.ip;
        } catch (e) {
            return 'Не удалось определить';
        }
    }
}

// Получение расширенной информации о местоположении
async function getEnhancedLocationInfo(ip) {
    if (ip === 'Не удалось определить') {
        return { error: 'Не удалось определить IP' };
    }
    
    try {
        // Пробуем несколько сервисов для большей точности
        const services = [
            `https://ipapi.co/${ip}/json/`,
            `https://ipwho.is/${ip}`
        ];
        
        let result = { ip: ip };
        
        for (const service of services) {
            try {
                const response = await fetch(service);
                const data = await response.json();
                
                // Объединяем результаты от разных сервисов
                result = { ...result, ...data };
                
                // Если получили достаточно информации, прерываем цикл
                if (data.country || data.city) break;
            } catch (e) {
                console.log(`Сервис ${service} недоступен`);
            }
        }
        
        // Форматируем результат
        return {
            ip: ip,
            country: result.country || result.country_name,
            countryCode: result.country_code || result.countryCode,
            region: result.region || result.region_name,
            regionCode: result.region_code,
            city: result.city,
            postalCode: result.postal || result.zip,
            latitude: result.latitude,
            longitude: result.longitude,
            timezone: result.timezone,
            currency: result.currency,
            isp: result.isp || result.org,
            asn: result.asn,
            isMobile: result.mobile || false,
            isProxy: result.proxy || false,
            isCrawler: result.crawler || false,
            isTor: result.tor || false
        };
    } catch (error) {
        return {
            ip: ip,
            error: 'Ошибка получения данных местоположения'
        };
    }
}

// Анализ реферера для определения источника
function analyzeReferrer() {
    const referrer = document.referrer;
    
    if (!referrer) {
        return {
            type: 'Прямой заход',
            source: 'direct',
            referrer: ''
        };
    }
    
    try {
        const url = new URL(referrer);
        const hostname = url.hostname;
        
        let type = 'Внешний источник';
        let source = 'external';
        let details = {};
        
        // Поисковые системы
        if (hostname.includes('google')) {
            type = 'Google';
            source = 'google';
            const query = url.searchParams.get('q');
            if (query) details.searchQuery = query;
        } 
        else if (hostname.includes('yandex')) {
            type = 'Yandex';
            source = 'yandex';
            const query = url.searchParams.get('text');
            if (query) details.searchQuery = query;
        }
        else if (hostname.includes('bing')) {
            type = 'Bing';
            source = 'bing';
        }
        else if (hostname.includes('yahoo')) {
            type = 'Yahoo';
            source = 'yahoo';
        }
        
        // Социальные сети
        else if (hostname.includes('facebook')) {
            type = 'Facebook';
            source = 'facebook';
        }
        else if (hostname.includes('twitter')) {
            type = 'Twitter';
            source = 'twitter';
        }
        else if (hostname.includes('instagram')) {
            type = 'Instagram';
            source = 'instagram';
        }
        else if (hostname.includes('vk.com')) {
            type = 'VKontakte';
            source = 'vkontakte';
        }
        else if (hostname.includes('t.me')) {
            type = 'Telegram';
            source = 'telegram';
        }
        else if (hostname.includes('whatsapp')) {
            type = 'WhatsApp';
            source = 'whatsapp';
        }
        
        // Мессенджеры и другие источники
        else if (hostname.includes('mail.')) {
            type = 'Email';
            source = 'email';
        }
        else if (hostname === location.hostname) {
            type = 'Внутренний переход';
            source = 'internal';
        }
        
        // UTM-метки
        const utmSource = getUTMParameter('utm_source');
        const utmMedium = getUTMParameter('utm_medium');
        const utmCampaign = getUTMParameter('utm_campaign');
        const utmContent = getUTMParameter('utm_content');
        const utmTerm = getUTMParameter('utm_term');
        
        if (utmSource) {
            type = utmSource.charAt(0).toUpperCase() + utmSource.slice(1);
            source = utmSource;
            details.utmMedium = utmMedium;
            details.utmCampaign = utmCampaign;
            details.utmContent = utmContent;
            details.utmTerm = utmTerm;
        }
        
        return {
            type: type,
            source: source,
            referrer: referrer,
            hostname: hostname,
            path: url.pathname,
            details: details
        };
    } catch {
        return {
            type: 'Внешний источник',
            source: 'external',
            referrer: referrer
        };
    }
}

// Получение UTM-параметров
function getUTMParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Получение информации об устройстве
function getDeviceInfo() {
    const ua = navigator.userAgent;
    
    // Определение типа устройства
    let deviceType = 'desktop';
    if (/mobile|android|iphone|ipod|ipad/i.test(ua)) {
        deviceType = 'mobile';
    } else if (/tablet|ipad/i.test(ua)) {
        deviceType = 'tablet';
    }
    
    // Определение ОС
    let os = 'Unknown';
    if (/windows/i.test(ua)) {
        os = 'Windows';
        if (/windows nt 10/i.test(ua)) os = 'Windows 10/11';
        else if (/windows nt 6.3/i.test(ua)) os = 'Windows 8.1';
        else if (/windows nt 6.2/i.test(ua)) os = 'Windows 8';
        else if (/windows nt 6.1/i.test(ua)) os = 'Windows 7';
    } else if (/macintosh|mac os x/i.test(ua)) {
        os = 'macOS';
    } else if (/linux/i.test(ua)) {
        os = 'Linux';
    } else if (/android/i.test(ua)) {
        os = 'Android';
    } else if (/iphone|ipad|ipod/i.test(ua)) {
        os = 'iOS';
    }
    
    return {
        type: deviceType,
        os: os,
        userAgent: ua,
        screen: {
            width: window.screen.width,
            height: window.screen.height,
            colorDepth: window.screen.colorDepth,
            pixelDepth: window.screen.pixelDepth
        },
        viewport: {
            width: window.innerWidth,
            height: window.innerHeight
        },
        touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        deviceMemory: navigator.deviceMemory || 'Unknown',
        hardwareConcurrency: navigator.hardwareConcurrency || 'Unknown'
    };
}

// Получение информации о браузере
function getBrowserInfo() {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    let version = 'Unknown';
    
    // Браузеры
    if (/edg/i.test(ua)) {
        browser = 'Edge';
        version = ua.match(/edg\/([0-9.]+)/i)[1];
    } else if (/chrome/i.test(ua)) {
        browser = 'Chrome';
        version = ua.match(/chrome\/([0-9.]+)/i)[1];
    } else if (/safari/i.test(ua)) {
        browser = 'Safari';
        version = ua.match(/version\/([0-9.]+)/i)?.[1] || 'Unknown';
    } else if (/firefox/i.test(ua)) {
        browser = 'Firefox';
        version = ua.match(/firefox\/([0-9.]+)/i)[1];
    } else if (/opera|opr/i.test(ua)) {
        browser = 'Opera';
        version = ua.match(/(opera|opr)\/([0-9.]+)/i)[2];
    }
    
    return {
        name: browser,
        version: version,
        language: navigator.language,
        languages: navigator.languages ? navigator.languages.join(', ') : navigator.language,
        cookieEnabled: navigator.cookieEnabled,
        javaEnabled: navigator.javaEnabled ? navigator.javaEnabled() : false,
        pdfViewerEnabled: navigator.pdfViewerEnabled || false,
        doNotTrack: navigator.doNotTrack || 'Unknown'
    };
}

// Проверка, является ли посетитель ботом
function checkIfBot() {
    const ua = navigator.userAgent.toLowerCase();
    const bots = [
        'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
        'yandexbot', 'sogou', 'exabot', 'facebot', 'ia_archiver',
        'sitecheck', 'mj12bot', 'ahrefs', 'semrush', 'dotbot'
    ];
    
    return bots.some(bot => ua.includes(bot));
}

// Получение информации о сети
async function getNetworkInfo() {
    const connection = navigator.connection || {};
    
    return {
        effectiveType: connection.effectiveType || 'Unknown',
        downlink: connection.downlink || 'Unknown',
        rtt: connection.rtt || 'Unknown',
        saveData: connection.saveData || false
    };
}

// Отправка информации в Telegram
async function sendToTelegram(visitorInfo) {
    if (!visitorInfo) return false;
    
    try {
        // Форматируем сообщение
        const message = formatTelegramMessage(visitorInfo);
        
        // Отправляем запрос
        const response = await fetch(`https://api.telegram.org/bot${VISITOR_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: VISITOR_CHAT_ID,
                text: message,
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

// Форматирование сообщения для Telegram
function formatTelegramMessage(visitorInfo) {
    const { location, referrer, device, browser, network, page, isBot } = visitorInfo;
    
    let message = `<b>👀 Новый посетитель на сайте!</b>\n\n`;
    
    message += `<b>📊 Основная информация:</b>\n`;
    message += `├─ ID сессии: <code>${visitorInfo.sessionId}</code>\n`;
    message += `├─ IP: <code>${location.ip}</code>\n`;
    message += `├─ Время: ${page.localTime}\n`;
    message += `├─ Бот: ${isBot ? '✅ Да' : '❌ Нет'}\n\n`;
    
    message += `<b>📍 Местоположение:</b>\n`;
    if (location.error) {
        message += `├─ Ошибка: ${location.error}\n`;
    } else {
        message += `├─ Страна: ${location.country} (${location.countryCode})\n`;
        message += `├─ Регион: ${location.region}\n`;
        message += `├─ Город: ${location.city}\n`;
        message += `├─ Почтовый индекс: ${location.postalCode || 'Неизвестно'}\n`;
        message += `├─ Координаты: ${location.latitude}, ${location.longitude}\n`;
        message += `├─ Часовой пояс: ${location.timezone}\n`;
        message += `├─ Провайдер: ${location.isp || 'Неизвестно'}\n`;
        message += `├─ Прокси/VPN: ${location.isProxy ? '✅ Да' : '❌ Нет'}\n`;
        message += `└─ TOR: ${location.isTor ? '✅ Да' : '❌ Нет'}\n\n`;
    }
    
    message += `<b>🔗 Источник перехода:</b>\n`;
    message += `├─ Тип: ${referrer.type}\n`;
    message += `├─ URL: ${referrer.referrer || 'Прямой заход'}\n`;
    if (referrer.details && referrer.details.searchQuery) {
        message += `├─ Поисковый запрос: "${referrer.details.searchQuery}"\n`;
    }
    if (referrer.details && referrer.details.utmCampaign) {
        message += `├─ UTM кампания: ${referrer.details.utmCampaign}\n`;
    }
    message += `└─ Хост: ${referrer.hostname || 'Неизвестно'}\n\n`;
    
    message += `<b>💻 Устройство и браузер:</b>\n`;
    message += `├─ Устройство: ${device.type}\n`;
    message += `├─ ОС: ${device.os}\n`;
    message += `├─ Браузер: ${browser.name} ${browser.version}\n`;
    message += `├─ Язык: ${browser.language}\n`;
    message += `├─ Разрешение: ${device.screen.width}x${device.screen.height}\n`;
    message += `├─ Поддержка touch: ${device.touchSupport ? '✅ Да' : '❌ Нет'}\n`;
    message += `└─ Память устройства: ${device.deviceMemory} GB\n\n`;
    
    message += `<b>🌐 Сеть:</b>\n`;
    message += `├─ Тип соединения: ${network.effectiveType}\n`;
    message += `├─ Скорость: ${network.downlink} Mbps\n`;
    message += `├─ Задержка: ${network.rtt} ms\n`;
    message += `└─ Режим экономии: ${network.saveData ? '✅ Вкл' : '❌ Выкл'}\n\n`;
    
    message += `<b>📄 Страница:</b>\n`;
    message += `├─ URL: ${page.url}\n`;
    message += `├─ Заголовок: ${page.title}\n`;
    message += `├─ Часовой пояс: ${page.timezone}\n`;
    message += `└─ Смещение: UTC${page.timezoneOffset > 0 ? '-' : '+'}${Math.abs(page.timezoneOffset)/60}\n`;
    
    return message;
}

// Отслеживание поведения пользователя
function trackUserBehavior() {
    let mouseMovements = 0;
    let clicksCount = 0;
    let keyPresses = 0;
    let scrollDepth = 0;
    let lastActivity = Date.now();
    
    // Отслеживание движения мыши
    document.addEventListener('mousemove', () => {
        mouseMovements++;
        lastActivity = Date.now();
    });
    
    // Отслеживание кликов
    document.addEventListener('click', (e) => {
        clicksCount++;
        lastActivity = Date.now();
    });
    
    // Отслеживание нажатий клавиш
    document.addEventListener('keydown', () => {
        keyPresses++;
        lastActivity = Date.now();
    });
    
    // Отслеживание скролла
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
        const scrollPercent = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
        if (scrollPercent > maxScroll) {
            maxScroll = scrollPercent;
            scrollDepth = maxScroll;
        }
        lastActivity = Date.now();
    });
    
    // Отправка информации о поведении при уходе со страницы
    window.addEventListener('beforeunload', () => {
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
        const inactivityTime = Math.round((Date.now() - lastActivity) / 1000);
        
        const behaviorInfo = {
            sessionId: visitorSessionId,
            timeSpent: timeSpent,
            inactivityTime: inactivityTime,
            mouseMovements: mouseMovements,
            clicks: clicksCount,
            keyPresses: keyPresses,
            scrollDepth: scrollDepth,
            exitPage: window.location.href,
            exitTime: new Date().toISOString()
        };
        
        // Отправляем информацию о поведении
        sendBehaviorInfo(behaviorInfo);
    });
}

// Отправка информации о поведении
async function sendBehaviorInfo(behaviorInfo) {
    try {
        const message = `
📊 <b>Поведение пользователя</b>

👤 ID сессии: <code>${behaviorInfo.sessionId}</code>
⏱ Время на сайте: ${behaviorInfo.timeSpent} сек
😴 Время бездействия: ${behaviorInfo.inactivityTime} сек
🖱 Движений мыши: ${behaviorInfo.mouseMovements}
👆 Кликов: ${behaviorInfo.clicks}
⌨️ Нажатий клавиш: ${behaviorInfo.keyPresses}
📏 Глубина скролла: ${behaviorInfo.scrollDepth}%
🚪 Страница выхода: ${behaviorInfo.exitPage}
⏰ Время выхода: ${new Date(behaviorInfo.exitTime).toLocaleString('ru-RU')}
        `;
        
        await fetch(`https://api.telegram.org/bot${VISITOR_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: VISITOR_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });
    } catch (error) {
        console.error('Ошибка отправки информации о поведении:', error);
    }
}

// Инициализация отслеживания
async function initEnhancedTracking() {
    // Проверяем, не отправляли ли мы уже информацию об этом посещении
    if (!sessionStorage.getItem('visitorTracked')) {
        const visitorInfo = await getEnhancedVisitorInfo();
        if (visitorInfo) {
            const success = await sendToTelegram(visitorInfo);
            if (success) {
                sessionStorage.setItem('visitorTracked', 'true');
            }
        }
    }
    
    // Запускаем отслеживание поведения
    trackUserBehavior();
}

// Отправка анонимного сообщения
async function sendAnonymousMessage(message) {
    try {
        const visitorInfo = await getEnhancedVisitorInfo();
        if (!visitorInfo) return false;
        
        const text = `👤 <b>Анонимное сообщение</b>\n\n💬 Сообщение: ${message}\n\n📊 Информация об отправителе:\n├─ IP: ${visitorInfo.ip}\n├─ Браузер: ${visitorInfo.browser.name}\n├─ Устройство: ${visitorInfo.device.type}\n└─ Время: ${new Date().toLocaleString('ru-RU')}`;
        
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
        console.error('Ошибка отправки анонимного сообщения:', error);
        return false;
    }
}

// Инициализация анонимной отправки сообщений
function initAnonymousMessage() {
    const modal = document.getElementById('anonymous-modal');
    const messageInput = document.getElementById('anonymous-message');
    const sendBtn = document.getElementById('send-anonymous');
    const closeBtns = document.querySelectorAll('.modal-close');
    const openBtn = document.getElementById('anonymous-message-btn');
    
    // Открытие модального окна
    openBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
        messageInput.focus();
    });
    
    // Закрытие модального окна
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modal.style.display = 'none';
            messageInput.value = '';
        });
    });
    
    // Закрытие при клике вне модального окна
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            messageInput.value = '';
        }
    });
    
    // Отправка сообщения
    sendBtn.addEventListener('click', async () => {
        const message = messageInput.value.trim();
        if (!message) {
            alert('Пожалуйста, введите сообщение');
            return;
        }
        
        sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
        sendBtn.disabled = true;
        
        const success = await sendAnonymousMessage(message);
        
        if (success) {
            alert('Сообщение отправлено анонимно!');
            modal.style.display = 'none';
            messageInput.value = '';
        } else {
            alert('Ошибка отправки сообщения. Попробуйте еще раз.');
        }
        
        sendBtn.innerHTML = 'Отправить анонимно';
        sendBtn.disabled = false;
    });
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initEnhancedTracking, 1000);
    initAnonymousMessage();
});