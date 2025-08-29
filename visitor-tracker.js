// visitor-tracker.js
// Расширенное отслеживание посетителей с отправкой в Telegram

const VISITOR_BOT_TOKEN = '8325858714:AAHsipAsY-Q_5SnR-pftMkhUSFYvq7lmhwE';
const VISITOR_CHAT_ID = '1860716243';

// Глобальные переменные
let visitorSessionId = generateSessionId();
let startTime = Date.now();
let currentPage = window.location.href;
let mouseMovements = 0;
let clicksCount = 0;
let keyPresses = 0;
let scrollDepth = 0;
let lastActivity = Date.now();
let isPageHidden = false;

// Генерация ID сессии
function generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

// Получение расширенной информации
async function getEnhancedVisitorInfo() {
    try {
        // Получаем IP
        const ipResponse = await getIPAddress();
        const ip = ipResponse.ip;
        const ipProvider = ipResponse.provider;
        
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
        const networkInfo = getNetworkInfo();
        
        // Получаем информацию о плагинах
        const pluginsInfo = await getPluginsInfo();
        
        // Получаем информацию о времени
        const timeInfo = getTimeInfo();
        
        return {
            sessionId: visitorSessionId,
            ip: ip,
            ipProvider: ipProvider,
            location: locationInfo,
            referrer: referrerInfo,
            device: deviceInfo,
            browser: browserInfo,
            network: networkInfo,
            plugins: pluginsInfo,
            time: timeInfo,
            page: {
                url: window.location.href,
                title: document.title,
                language: navigator.language,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                timezoneOffset: new Date().getTimezoneOffset(),
                localTime: new Date().toLocaleString('ru-RU'),
                encoding: document.characterSet || document.charset,
                referrer: document.referrer
            },
            isBot: isBot,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };
    } catch (error) {
        console.error('Ошибка получения информации о посетителе:', error);
        return getFallbackInfo();
    }
}

// Получение IP-адреса с нескольких сервисов
async function getIPAddress() {
    const services = [
        { url: 'https://api.ipify.org?format=json', provider: 'ipify' },
        { url: 'https://ipinfo.io/json', provider: 'ipinfo' },
        { url: 'https://api.myip.com', provider: 'myip' },
        { url: 'https://ipapi.co/json/', provider: 'ipapi' }
    ];
    
    for (const service of services) {
        try {
            const response = await fetch(service.url, { timeout: 5000 });
            if (!response.ok) continue;
            
            const data = await response.json();
            return {
                ip: data.ip || data.query || data.ipAddress,
                provider: service.provider
            };
        } catch (e) {
            continue;
        }
    }
    
    return { ip: 'Не удалось определить', provider: 'none' };
}

// Получение расширенной информации о местоположении
async function getEnhancedLocationInfo(ip) {
    if (ip === 'Не удалось определить') {
        return { error: 'Не удалось определить IP' };
    }
    
    try {
        const services = [
            `https://ipapi.co/${ip}/json/`,
            `https://ipwho.is/${ip}`,
            `https://geolocation-db.com/json/${ip}`
        ];
        
        let result = { ip: ip };
        
        for (const service of services) {
            try {
                const response = await fetch(service, { timeout: 3000 });
                if (!response.ok) continue;
                
                const data = await response.json();
                result = { ...result, ...data };
                
                if (data.country || data.city) break;
            } catch (e) {
                continue;
            }
        }
        
        return {
            ip: ip,
            country: result.country || result.country_name || result.country_name,
            countryCode: result.country_code || result.countryCode || result.country_code,
            region: result.region || result.region_name || result.state,
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
            isTor: result.tor || false,
            callingCode: result.country_calling_code
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
        const searchEngines = {
            'google': { name: 'Google', param: 'q' },
            'yandex': { name: 'Yandex', param: 'text' },
            'bing': { name: 'Bing', param: 'q' },
            'yahoo': { name: 'Yahoo', param: 'p' },
            'duckduckgo': { name: 'DuckDuckGo', param: 'q' },
            'baidu': { name: 'Baidu', param: 'wd' }
        };
        
        for (const [domain, engine] of Object.entries(searchEngines)) {
            if (hostname.includes(domain)) {
                type = engine.name;
                source = domain;
                const query = url.searchParams.get(engine.param);
                if (query) details.searchQuery = query;
                break;
            }
        }
        
        // Социальные сети
        const socialNetworks = {
            'facebook': 'Facebook',
            'twitter': 'Twitter',
            'instagram': 'Instagram',
            'vk.com': 'VKontakte',
            't.me': 'Telegram',
            'whatsapp': 'WhatsApp',
            'linkedin': 'LinkedIn',
            'pinterest': 'Pinterest',
            'tiktok': 'TikTok',
            'reddit': 'Reddit'
        };
        
        for (const [domain, name] of Object.entries(socialNetworks)) {
            if (hostname.includes(domain)) {
                type = name;
                source = domain;
                break;
            }
        }
        
        // Другие источники
        if (hostname.includes('mail.') || hostname.includes('email')) {
            type = 'Email';
            source = 'email';
        } else if (hostname === location.hostname) {
            type = 'Внутренний переход';
            source = 'internal';
        }
        
        // UTM-метки
        const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
        const utmData = {};
        
        utmParams.forEach(param => {
            const value = getUTMParameter(param);
            if (value) utmData[param] = value;
        });
        
        if (Object.keys(utmData).length > 0) {
            type = utmData.utm_source ? utmData.utm_source.charAt(0).toUpperCase() + utmData.utm_source.slice(1) : type;
            source = utmData.utm_source || source;
            details.utm = utmData;
        }
        
        return {
            type: type,
            source: source,
            referrer: referrer,
            hostname: hostname,
            path: url.pathname,
            query: url.search,
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
    let isMobile = /mobile|android|iphone|ipod|ipad/i.test(ua);
    let isTablet = /tablet|ipad/i.test(ua);
    
    if (isMobile) deviceType = 'mobile';
    if (isTablet) deviceType = 'tablet';
    
    // Определение ОС
    let os = 'Unknown';
    let osVersion = 'Unknown';
    
    const osPatterns = [
        { pattern: /windows nt 10/i, name: 'Windows 10/11', version: '10+' },
        { pattern: /windows nt 6.3/i, name: 'Windows 8.1', version: '6.3' },
        { pattern: /windows nt 6.2/i, name: 'Windows 8', version: '6.2' },
        { pattern: /windows nt 6.1/i, name: 'Windows 7', version: '6.1' },
        { pattern: /windows nt 6.0/i, name: 'Windows Vista', version: '6.0' },
        { pattern: /windows nt 5.1/i, name: 'Windows XP', version: '5.1' },
        { pattern: /macintosh|mac os x/i, name: 'macOS', version: /mac os x (\d+[._]\d+)/i },
        { pattern: /linux/i, name: 'Linux', version: /linux/i },
        { pattern: /android/i, name: 'Android', version: /android (\d+[._]\d+)/i },
        { pattern: /iphone|ipad|ipod/i, name: 'iOS', version: /os (\d+[._]\d+)/i }
    ];
    
    for (const osPattern of osPatterns) {
        if (osPattern.pattern.test(ua)) {
            os = osPattern.name;
            
            if (osPattern.version instanceof RegExp) {
                const match = ua.match(osPattern.version);
                if (match && match[1]) {
                    osVersion = match[1].replace('_', '.');
                }
            } else if (typeof osPattern.version === 'string') {
                osVersion = osPattern.version;
            }
            
            break;
        }
    }
    
    // Определение архитектуры
    let architecture = 'Unknown';
    if (/win64|x64|wow64|amd64/i.test(ua)) {
        architecture = 'x64';
    } else if (/win32|wow32/i.test(ua)) {
        architecture = 'x86';
    } else if (/arm64|aarch64/i.test(ua)) {
        architecture = 'ARM64';
    } else if (/arm/i.test(ua)) {
        architecture = 'ARM';
    }
    
    return {
        type: deviceType,
        os: os,
        osVersion: osVersion,
        architecture: architecture,
        userAgent: ua,
        screen: {
            width: window.screen.width,
            height: window.screen.height,
            colorDepth: window.screen.colorDepth,
            pixelDepth: window.screen.pixelDepth,
            availWidth: window.screen.availWidth,
            availHeight: window.screen.availHeight
        },
        viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
            ratio: window.devicePixelRatio || 1
        },
        touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        deviceMemory: navigator.deviceMemory || 'Unknown',
        hardwareConcurrency: navigator.hardwareConcurrency || 'Unknown',
        platform: navigator.platform
    };
}

// Получение информации о браузере
function getBrowserInfo() {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    let version = 'Unknown';
    let engine = 'Unknown';
    
    // Определение движка
    if (/applewebkit/i.test(ua)) {
        engine = 'WebKit';
        if (/chrome/i.test(ua)) {
            engine = 'Blink';
        }
    } else if (/gecko/i.test(ua)) {
        engine = 'Gecko';
    } else if (/trident/i.test(ua)) {
        engine = 'Trident';
    }
    
    // Определение браузера
    const browserPatterns = [
        { pattern: /edg/i, name: 'Edge', version: /edg\/([0-9.]+)/i },
        { pattern: /chrome/i, name: 'Chrome', version: /chrome\/([0-9.]+)/i },
        { pattern: /safari/i, name: 'Safari', version: /version\/([0-9.]+)/i },
        { pattern: /firefox/i, name: 'Firefox', version: /firefox\/([0-9.]+)/i },
        { pattern: /opera|opr/i, name: 'Opera', version: /(opera|opr)\/([0-9.]+)/i },
        { pattern: /msie|trident/i, name: 'Internet Explorer', version: /(msie |rv:)([0-9.]+)/i },
        { pattern: /samsungbrowser/i, name: 'Samsung Browser', version: /samsungbrowser\/([0-9.]+)/i }
    ];
    
    for (const browserPattern of browserPatterns) {
        if (browserPattern.pattern.test(ua)) {
            browser = browserPattern.name;
            
            const match = ua.match(browserPattern.version);
            if (match && (match[1] || match[2])) {
                version = match[1] || match[2];
            }
            
            break;
        }
    }
    
    return {
        name: browser,
        version: version,
        fullVersion: navigator.appVersion,
        engine: engine,
        language: navigator.language,
        languages: navigator.languages ? navigator.languages.join(', ') : navigator.language,
        cookieEnabled: navigator.cookieEnabled,
        javaEnabled: navigator.javaEnabled ? navigator.javaEnabled() : false,
        pdfViewerEnabled: navigator.pdfViewerEnabled || false,
        doNotTrack: navigator.doNotTrack || 'Unknown',
        vendor: navigator.vendor || 'Unknown'
    };
}

// Получение информации о плагинах
async function getPluginsInfo() {
    try {
        const plugins = [];
        
        // Стандартные плагины
        if (navigator.plugins && navigator.plugins.length > 0) {
            for (let i = 0; i < navigator.plugins.length; i++) {
                plugins.push({
                    name: navigator.plugins[i].name,
                    filename: navigator.plugins[i].filename,
                    description: navigator.plugins[i].description,
                    version: navigator.plugins[i].version
                });
            }
        }
        
        // Проверка поддержки различных технологий
        const features = {
            localStorage: !!window.localStorage,
            sessionStorage: !!window.sessionStorage,
            indexedDB: !!window.indexedDB,
            serviceWorker: 'serviceWorker' in navigator,
            webGL: hasWebGL(),
            webRTC: !!navigator.mediaDevices,
            geolocation: 'geolocation' in navigator,
            notifications: 'Notification' in window,
            pushManager: 'PushManager' in window,
            webAssembly: 'WebAssembly' in window,
            webAudio: 'AudioContext' in window || 'webkitAudioContext' in window,
            webShare: 'share' in navigator,
            webBluetooth: 'bluetooth' in navigator,
            webUSB: 'usb' in navigator,
            webNFC: 'nfc' in navigator,
            webXR: 'xr' in navigator
        };
        
        return {
            plugins: plugins,
            features: features,
            mimeTypes: navigator.mimeTypes ? navigator.mimeTypes.length : 0
        };
    } catch (error) {
        return { error: 'Не удалось получить информацию о плагинах' };
    }
}

// Проверка поддержки WebGL
function hasWebGL() {
    try {
        const canvas = document.createElement('canvas');
        return !!(
            window.WebGLRenderingContext &&
            (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
        );
    } catch (e) {
        return false;
    }
}

// Получение информации о времени
function getTimeInfo() {
    const now = new Date();
    return {
        localTime: now.toLocaleString('ru-RU'),
        utcTime: now.toUTCString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timezoneOffset: now.getTimezoneOffset(),
        daylightSaving: now.getTimezoneOffset() < Math.max(now.getTimezoneOffset(), new Date(now.getFullYear(), 0, 1).getTimezoneOffset()),
        timestamp: now.getTime(),
        timezoneName: now.toLocaleTimeString('en-us', { timeZoneName: 'short' }).split(' ')[2]
    };
}

// Проверка, является ли посетитель ботом
function checkIfBot() {
    const ua = navigator.userAgent.toLowerCase();
    const bots = [
        'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
        'yandexbot', 'sogou', 'exabot', 'facebot', 'ia_archiver',
        'sitecheck', 'mj12bot', 'ahrefs', 'semrush', 'dotbot',
        'moz.com', 'petalbot', 'applebot', 'crawler', 'spider',
        'robot', 'checkmark', 'monitor', 'scan', 'bot'
    ];
    
    return bots.some(bot => ua.includes(bot));
}

// Получение информации о сети
function getNetworkInfo() {
    const connection = navigator.connection || {};
    
    return {
        effectiveType: connection.effectiveType || 'Unknown',
        downlink: connection.downlink || 'Unknown',
        rtt: connection.rtt || 'Unknown',
        saveData: connection.saveData || false,
        type: connection.type || 'Unknown',
        downlinkMax: connection.downlinkMax || 'Unknown'
    };
}

// Резервная информация при ошибке
function getFallbackInfo() {
    return {
        sessionId: visitorSessionId,
        ip: 'Неизвестно',
        page: {
            url: window.location.href,
            title: document.title,
            language: navigator.language
        },
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        error: 'Не удалось собрать полную информацию'
    };
}

// Отслеживание поведения пользователя
function trackUserBehavior() {
    // Отслеживание движения мыши
    document.addEventListener('mousemove', () => {
        mouseMovements++;
        lastActivity = Date.now();
    });
    
    // Отслеживание кликов
    document.addEventListener('click', (e) => {
        clicksCount++;
        lastActivity = Date.now();
        
        // Логирование информации о клике
        const clickInfo = {
            x: e.clientX,
            y: e.clientY,
            target: e.target.tagName,
            id: e.target.id || 'нет',
            class: e.target.className || 'нет',
            time: new Date().toISOString()
        };
    });
    
    // Отслеживание нажатий клавиш
    document.addEventListener('keydown', (e) => {
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
    
    // Отслеживание изменения видимости страницы
    document.addEventListener('visibilitychange', () => {
        isPageHidden = document.hidden;
    });
    
    // Отслеживание изменения размера окна
    window.addEventListener('resize', () => {
        lastActivity = Date.now();
    });
    
    // Отслеживание фокуса/потери фокуса
    window.addEventListener('focus', () => {
        lastActivity = Date.now();
    });
    
    window.addEventListener('blur', () => {
        lastActivity = Date.now();
    });
    
    // Периодическая отправка активности
    setInterval(() => {
        const inactiveTime = Math.round((Date.now() - lastActivity) / 1000);
        if (inactiveTime > 60) {
            // Пользователь неактивен более 60 секунд
        }
    }, 30000);
    
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
            exitTime: new Date().toISOString(),
            pageHidden: isPageHidden
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
📱 Страница скрыта: ${behaviorInfo.pageHidden ? 'Да' : 'Нет'}
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
                parse_mode: 'HTML',
                disable_web_page_preview: true
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
    const { location, referrer, device, browser, network, plugins, time, page, isBot } = visitorInfo;
    
    let message = `<b>👀 Новый посетитель на сайте!</b>\n\n`;
    
    message += `<b>📊 Основная информация:</b>\n`;
    message += `├─ ID сессии: <code>${visitorInfo.sessionId}</code>\n`;
    message += `├─ IP: <code>${location.ip}</code> (via ${visitorInfo.ipProvider})\n`;
    message += `├─ Время: ${page.localTime}\n`;
    message += `├─ Бот: ${isBot ? '✅ Да' : '❌ Нет'}\n`;
    message += `├─ Кодировка: ${page.encoding || 'Неизвестно'}\n`;
    message += `└─ User Agent: ${visitorInfo.userAgent.substring(0, 50)}...\n\n`;
    
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
        message += `├─ Валюта: ${location.currency || 'Неизвестно'}\n`;
        message += `├─ Провайдер: ${location.isp || 'Неизвестно'}\n`;
        message += `├─ ASN: ${location.asn || 'Неизвестно'}\n`;
        message += `├─ Код телефона: ${location.callingCode || 'Неизвестно'}\n`;
        message += `├─ Прокси/VPN: ${location.isProxy ? '✅ Да' : '❌ Нет'}\n`;
        message += `└─ TOR: ${location.isTor ? '✅ Да' : '❌ Нет'}\n\n`;
    }
    
    message += `<b>🔗 Источник перехода:</b>\n`;
    message += `├─ Тип: ${referrer.type}\n`;
    message += `├─ Источник: ${referrer.source}\n`;
    message += `├─ URL: ${referrer.referrer || 'Прямой заход'}\n`;
    message += `├─ Домен: ${referrer.hostname || 'Неизвестно'}\n`;
    if (referrer.details && referrer.details.searchQuery) {
        message += `├─ Поисковый запрос: "${referrer.details.searchQuery}"\n`;
    }
    if (referrer.details && referrer.details.utm) {
        message += `├─ UTM метки: ${JSON.stringify(referrer.details.utm)}\n`;
    }
    message += `└─ Оригинальный реферер: ${page.referrer || 'Отсутствует'}\n\n`;
    
    message += `<b>💻 Устройство и браузер:</b>\n`;
    message += `├─ Устройство: ${device.type}\n`;
    message += `├─ ОС: ${device.os} ${device.osVersion}\n`;
    message += `├─ Архитектура: ${device.architecture}\n`;
    message += `├─ Браузер: ${browser.name} ${browser.version}\n`;
    message += `├─ Движок: ${browser.engine}\n`;
    message += `├─ Язык: ${browser.language}\n`;
    message += `├─ Производитель: ${browser.vendor}\n`;
    message += `├─ Разрешение: ${device.screen.width}x${device.screen.height}\n`;
    message += `├─ Viewport: ${device.viewport.width}x${device.viewport.height}\n`;
    message += `├─ Пиксельное соотношение: ${device.viewport.ratio}\n`;
    message += `├─ Поддержка touch: ${device.touchSupport ? '✅ Да' : '❌ Нет'}\n`;
    message += `├─ Память устройства: ${device.deviceMemory} GB\n`;
    message += `├─ Ядер CPU: ${device.hardwareConcurrency}\n`;
    message += `└─ Платформа: ${device.platform}\n\n`;
    
    message += `<b>🌐 Сеть:</b>\n`;
    message += `├─ Тип соединения: ${network.effectiveType}\n`;
    message += `├─ Скорость: ${network.downlink} Mbps\n`;
    message += `├─ Задержка: ${network.rtt} ms\n`;
    message += `├─ Тип сети: ${network.type}\n`;
    message += `├─ Макс. скорость: ${network.downlinkMax}\n`;
    message += `└─ Режим экономии: ${network.saveData ? '✅ Вкл' : '❌ Выкл'}\n\n`;
    
    message += `<b>🛠 Плагины и возможности:</b>\n`;
    message += `├─ Количество плагинов: ${plugins.plugins ? plugins.plugins.length : 0}\n`;
    message += `├─ MIME types: ${plugins.mimeTypes}\n`;
    message += `├─ WebGL: ${plugins.features.webGL ? '✅ Да' : '❌ Нет'}\n`;
    message += `├─ Service Workers: ${plugins.features.serviceWorker ? '✅ Да' : '❌ Нет'}\n`;
    message += `└─ Геолокация: ${plugins.features.geolocation ? '✅ Да' : '❌ Нет'}\n\n`;
    
    message += `<b>📄 Страница:</b>\n`;
    message += `├─ URL: <code>${page.url}</code>\n`;
    message += `├─ Заголовок: ${page.title}\n`;
    message += `├─ Часовой пояс: ${page.timezone}\n`;
    message += `├─ Смещение: UTC${page.timezoneOffset > 0 ? '-' : '+'}${Math.abs(page.timezoneOffset)/60}\n`;
    message += `└─ Локальное время: ${page.localTime}\n`;
    
    return message;
}

// Инициализация отслеживания
async function initEnhancedTracking() {
    // Проверяем, не отправляли ли мы уже информацию об этом посещении
    if (!sessionStorage.getItem('visitorTracked')) {
        try {
            const visitorInfo = await getEnhancedVisitorInfo();
            if (visitorInfo) {
                const success = await sendToTelegram(visitorInfo);
                if (success) {
                    sessionStorage.setItem('visitorTracked', 'true');
                    sessionStorage.setItem('visitorSessionId', visitorSessionId);
                }
            }
        } catch (error) {
            console.error('Ошибка инициализации отслеживания:', error);
        }
    } else {
        // Восстанавливаем ID сессии если уже отслеживали
        visitorSessionId = sessionStorage.getItem('visitorSessionId') || visitorSessionId;
    }
    
    // Запускаем отслеживание поведения
    trackUserBehavior();
}

// Отправка анонимного сообщения
async function sendAnonymousMessage(message) {
    try {
        const visitorInfo = await getEnhancedVisitorInfo();
        if (!visitorInfo) return false;
        
        const text = `👤 <b>Анонимное сообщение</b>\n\n💬 Сообщение: ${message}\n\n📊 Информация об отправителе:\n├─ IP: ${visitorInfo.ip}\n├─ Браузер: ${visitorInfo.browser.name}\n├─ Устройство: ${visitorInfo.device.type}\n├─ ОС: ${visitorInfo.device.os}\n└─ Время: ${new Date().toLocaleString('ru-RU')}`;
        
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

// Экспорт функций для использования в других скриптах
window.visitorTracker = {
    init: initEnhancedTracking,
    sendAnonymousMessage: sendAnonymousMessage,
    getInfo: getEnhancedVisitorInfo
};

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Задержка для обеспечения загрузки страницы
    setTimeout(initEnhancedTracking, 1500);
});

// Отслеживание SPA навигации (если применимо)
if (typeof window.history !== 'undefined' && typeof window.history.pushState === 'function') {
    const originalPushState = history.pushState;
    history.pushState = function() {
        originalPushState.apply(this, arguments);
        window.dispatchEvent(new Event('pushstate'));
    };
    
    window.addEventListener('pushstate', function() {
        currentPage = window.location.href;
    });
    
    window.addEventListener('popstate', function() {
        currentPage = window.location.href;
    });
}