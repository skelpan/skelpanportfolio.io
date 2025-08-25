// AI Assistant with smart responses and Telegram integration
class AIAssistant {
    constructor() {
        this.assistant = document.getElementById("assistant");
        this.assistantBody = document.getElementById("assistant-body");
        this.assistantInput = document.getElementById("assistant-input");
        this.sendBtn = document.getElementById("assistant-send");
        this.clearBtn = document.getElementById("assistant-clear");
        this.closeBtn = document.getElementById("assistant-close");
        
        this.knowledgeBase = {
            projects: [
                {
                    name: "Aniduo",
                    description: "Подарок для владелицы студии Aniduo с сбором поздравлений",
                    url: "https://skelpan.github.io/aniduo.io/",
                    tech: ["UI/UX", "React", "D3.js"]
                },
                {
                    name: "Podarok Sistr", 
                    description: "Поздравление сестре с днем рождения с новыми методами дизайна",
                    url: "https://skelpan.github.io/podaroksustr.io/",
                    tech: ["Flutter", "Motion Design", "iOS/Android"]
                },
                {
                    name: "_Mr_Block",
                    description: "Сайт для программиста с Cristalix с современными технологиями",
                    url: "https://skelpan.github.io/_mr_block_portfolio.io/",
                    tech: ["HTML/CSS/JS", "Анимации", "Адаптивный дизайн"]
                }
            ],
            skills: {
                technical: ["HTML", "CSS", "JavaScript", "React", "Flutter", "UI/UX Design"],
                personal: ["Преданность", "Доброта", "Ум", "Логика", "Творчество", "Понимание"],
                interests: ["Видеоигры", "Компьютеры", "Музыка", "Общение", "Дизайн"]
            },
            contacts: {
                telegram: "https://t.me/skelpan31",
                github: "https://github.com/skelpan",
                email: "Через форму на сайте"
            },
            personality: {
                traits: ["добрый", "умный", "общительный", "творческий", "логичный"],
                hobbies: ["видеоигры", "программирование", "дизайн", "музыка", "общение"],
                favoriteMusic: "Тринадцать Карат"
            }
        };
        
        // Состояние диалога для контекстного общения
        this.dialogState = {
            lastTopic: null,
            userName: null,
            userInterests: []
        };
        
        this.init();
    }
    
    init() {
        // Event listeners
        document.getElementById("assistant-toggle").addEventListener("click", () => this.toggleAssistant());
        if (document.getElementById("mobile-assistant-toggle")) {
            document.getElementById("mobile-assistant-toggle").addEventListener("click", () => this.toggleAssistant());
        }
        this.closeBtn.addEventListener("click", () => this.hideAssistant());
        this.sendBtn.addEventListener("click", () => this.sendMessage());
        this.clearBtn.addEventListener("click", () => this.clearChat());
        this.assistantInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") this.sendMessage();
        });
        
        // Quick replies
        this.addQuickReplies();
        
        // Drag functionality for assistant window
        this.makeDraggable();
        
        // Load chat history
        this.loadChatHistory();
    }
    
    addQuickReplies() {
        const quickReplies = [
            { text: "💼 Проекты", message: "Расскажи о своих проектах" },
            { text: "🛠 Навыки", message: "Какие у тебя навыки" },
            { text: "📞 Контакты", message: "Как с тобой связаться" },
            { text: "🎮 Игры", message: "Какие игры тебе нравятся" },
            { text: "🎵 Музыка", message: "Какую музыку ты слушаешь" },
            { text: "🤖 О себе", message: "Расскажи о себе" }
        ];
        
        const repliesContainer = document.createElement("div");
        repliesContainer.className = "quick-replies-container";
        
        quickReplies.forEach(reply => {
            const btn = document.createElement("button");
            btn.className = "quick-reply";
            btn.textContent = reply.text;
            btn.setAttribute("data-message", reply.message);
            btn.addEventListener("click", () => {
                this.assistantInput.value = reply.message;
                this.sendMessage();
            });
            repliesContainer.appendChild(btn);
        });
        
        // Добавляем контейнер с быстрыми ответами после основного контента
        this.assistantBody.parentNode.insertBefore(repliesContainer, this.assistantBody.nextSibling);
    }
    
    makeDraggable() {
        const header = this.assistant.querySelector('.assistant-header');
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;
        
        const dragStart = (e) => {
            if (e.target.closest('.assistant-controls')) return;
            
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
            
            if (e.target === header || e.target.parentElement === header) {
                isDragging = true;
            }
        };
        
        const dragEnd = (e) => {
            initialX = currentX;
            initialY = currentY;
            
            isDragging = false;
        };
        
        const drag = (e) => {
            if (isDragging) {
                e.preventDefault();
                
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                
                xOffset = currentX;
                yOffset = currentY;
                
                this.setTranslate(currentX, currentY, this.assistant);
            }
        };
        
        header.addEventListener("mousedown", dragStart);
        header.addEventListener("mouseup", dragEnd);
        header.addEventListener("mousemove", drag);
    }
    
    setTranslate(xPos, yPos, el) {
        el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
    }
    
    toggleAssistant() {
        this.assistant.style.display = this.assistant.style.display === "flex" ? "none" : "flex";
        if (this.assistant.style.display === "flex") {
            this.assistantInput.focus();
        }
    }
    
    hideAssistant() {
        this.assistant.style.display = "none";
    }
    
    sendMessage() {
        const text = this.assistantInput.value.trim();
        if (!text) return;
        
        this.appendMessage(text, "user");
        this.assistantInput.value = "";
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Generate response with delay
        setTimeout(() => {
            this.hideTypingIndicator();
            const response = this.generateResponse(text.toLowerCase());
            this.appendMessage(response, "bot");
            this.saveChatHistory();
            
            // Если сообщение содержит контактную информацию, отправить в Telegram
            if (text.includes('свяжись') || text.includes('contact') || text.includes('телефон') || text.includes('email')) {
                this.sendToTelegram(`Пользователь запросил контакт: ${text}`);
            }
        }, 800 + Math.random() * 800);
    }
    
    generateResponse(message) {
        // Extract user name if mentioned
        this.extractUserInfo(message);
        
        // Greetings
        if (this.matchPattern(message, ['привет', 'здравств', 'hi', 'hello', 'хай', 'добр'])) {
            const greeting = this.getTimeBasedGreeting();
            if (this.dialogState.userName) {
                return `${greeting}, ${this.dialogState.userName}! 👋 Чем могу помочь?`;
            }
            return `${greeting}! 👋 Я AI-помощник skelpan. Рад общению! Как к вам обращаться?`;
        }
        
        // User name handling
        if (this.matchPattern(message, ['меня зовут', 'мое имя', 'зовут'])) {
            return `Приятно познакомиться, ${this.dialogState.userName}! Чем могу помочь?`;
        }
        
        // About
        if (this.matchPattern(message, ['кто ты', 'о себе', 'расскаж', 'about', 'ты кто'])) {
            return "Я цифровой помощник skelpan - веб-дизайнера и разработчика. Могу рассказать о проектах, навыках или просто пообщаться! 🚀";
        }
        
        // Projects
        if (this.matchPattern(message, ['проект', 'работ', 'portfolio', 'aniduo', 'podarok', 'block', 'сайт', 'портфолио'])) {
            this.dialogState.lastTopic = "projects";
            let response = "🎯 Мои проекты:\n\n";
            this.knowledgeBase.projects.forEach(project => {
                response += `• ${project.name}: ${project.description}\n`;
                response += `  🔗 ${project.url}\n`;
                response += `  🛠 ${project.tech.join(', ')}\n\n`;
            });
            response += "Хочешь узнать подробнее о каком-то конкретном проекте?";
            return response;
        }
        
        // Skills
        if (this.matchPattern(message, ['навык', 'умение', 'skill', 'технолог', 'stack', 'умеешь', 'что ты умеешь'])) {
            this.dialogState.lastTopic = "skills";
            return `💪 Мои навыки:\n\n💻 Технические: ${this.knowledgeBase.skills.technical.join(', ')}\n\n❤️ Личностные: ${this.knowledgeBase.skills.personal.join(', ')}\n\n🎮 Интересы: ${this.knowledgeBase.skills.interests.join(', ')}`;
        }
        
        // Contacts
        if (this.matchPattern(message, ['контакт', 'связать', 'telegram', 'tg', 'github', 'почта', 'email'])) {
            this.dialogState.lastTopic = "contacts";
            return `📞 Контакты:\n\n📱 Telegram: ${this.knowledgeBase.contacts.telegram}\n\n🐙 GitHub: ${this.knowledgeBase.contacts.github}\n\n📧 Email: ${this.knowledgeBase.contacts.email}`;
        }
        
        // Games
        if (this.matchPattern(message, ['игр', 'game', 'играешь', 'гейм', 'видеоигр'])) {
            this.dialogState.lastTopic = "games";
            this.dialogState.userInterests.push("games");
            return "🎮 Обожаю видеоигры! Особенно стратегии, RPG и инди-игры. Люблю обсуждать геймдизайн и интересные механики. А во что играешь ты?";
        }
        
        // Music
        if (this.matchPattern(message, ['музык', 'music', 'тринадцать', 'карат', 'слушаешь', 'исполнитель'])) {
            this.dialogState.lastTopic = "music";
            this.dialogState.userInterests.push("music");
            return "🎵 Мой любимый исполнитель - 'Тринадцать Карат'! У них глубокая лирика и уникальное звучание. Также слушаю разную альтернативную музыку. А какую музыку любишь ты?";
        }
        
        // Help
        if (this.matchPattern(message, ['помощ', 'help', 'команды', 'что ты умеешь'])) {
            return "🤖 Я могу:\n\n• Рассказать о проектах\n• Показать навыки\n• Дать контакты\n• Поболтать об играх и музыке\n• Ответить на вопросы\n\nПросто спроси о чем угодно!";
        }
        
        // Thanks
        if (this.matchPattern(message, ['спасиб', 'благодар', 'thanks', 'thank'])) {
            return "Пожалуйста! 😊 Рад, что смог помочь. Если есть еще вопросы - обращайся!";
        }
        
        // Goodbye
        if (this.matchPattern(message, ['пока', 'до свидан', 'прощай', 'bye', 'goodbye'])) {
            return "До свидания! Буду рад пообщаться снова. Удачи! 👋";
        }
        
        // Default response with context awareness
        return this.getContextualResponse(message);
    }
    
    extractUserInfo(message) {
        // Try to extract user name
        const namePatterns = [
            /меня зовут (\w+)/i,
            /мое имя (\w+)/i,
            /зовут (\w+)/i,
            /я (\w+)/i
        ];
        
        for (const pattern of namePatterns) {
            const match = message.match(pattern);
            if (match && match[1]) {
                this.dialogState.userName = match[1];
                break;
            }
        }
    }
    
    getTimeBasedGreeting() {
        const hour = new Date().getHours();
        if (hour < 6) return "Доброй ночи";
        if (hour < 12) return "Доброе утро";
        if (hour < 18) return "Добрый день";
        return "Добрый вечер";
    }
    
    getContextualResponse(message) {
        // Context-aware responses based on last topic
        if (this.dialogState.lastTopic === "projects") {
            return "Хочешь узнать о других моих проектах или maybe что-то еще?";
        }
        
        if (this.dialogState.lastTopic === "games") {
            if (this.matchPattern(message, ['да', 'конечно', 'ага', 'yes'])) {
                return "Круто! В какие игры ты сейчас играешь? Может быть, у нас есть общие favorites?";
            }
            return "Расскажи о своих любимых играх! Мне интересно узнать, что тебе нравится.";
        }
        
        if (this.dialogState.lastTopic === "music") {
            if (this.matchPattern(message, ['да', 'конечно', 'ага', 'yes'])) {
                return "Отлично! Какую музыку ты предпочитаешь? Может, посоветуешь что-то интересное?";
            }
            return "Музыка - это здорово! Что ты любишь слушать?";
        }
        
        // Random friendly responses
        const defaultResponses = [
            "Интересный вопрос! Могу рассказать больше о моих проектах или ответить на другие вопросы. 😊",
            "Хороший вопрос! Что еще хочешь узнать? Может быть, о моих навыках или проектах? 🚀",
            "Любопытно! Могу показать примеры работ или рассказать о технологиях, которые использую. 💡",
            "Отличная тема для обсуждения! Давай поговорим о чем-то конкретном - проектах, играх или дизайне? 🎮",
            "Интересно! Может, расскажешь немного о себе? Чем увлекаешься?",
            "Замечательно! Есть что-то конкретное, что хочешь узнать? Могу рассказать о проектах, навыках или просто поболтать 😊"
        ];
        
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }
    
    matchPattern(message, patterns) {
        return patterns.some(pattern => message.includes(pattern));
    }
    
    appendMessage(text, type) {
        const msgDiv = document.createElement("div");
        msgDiv.className = `msg ${type}`;
        
        const contentDiv = document.createElement("div");
        contentDiv.className = "msg-content";
        
        // Format text with line breaks
        const formattedText = text.replace(/\n/g, '<br>');
        contentDiv.innerHTML = formattedText;
        
        msgDiv.appendChild(contentDiv);
        this.assistantBody.appendChild(msgDiv);
        this.assistantBody.scrollTop = this.assistantBody.scrollHeight;
    }
    
    showTypingIndicator() {
        const typingDiv = document.createElement("div");
        typingDiv.className = "msg bot typing";
        
        const contentDiv = document.createElement("div");
        contentDiv.className = "msg-content";
        contentDiv.innerHTML = '<div class="typing-animation"><span></span><span></span><span></span></div>';
        typingDiv.appendChild(contentDiv);
        
        this.assistantBody.appendChild(typingDiv);
        this.assistantBody.scrollTop = this.assistantBody.scrollHeight;
        this.typingIndicator = typingDiv;
    }
    
    hideTypingIndicator() {
        if (this.typingIndicator && this.typingIndicator.parentElement) {
            this.typingIndicator.remove();
        }
    }
    
    clearChat() {
        if (confirm("Очистить всю историю чата?")) {
            // Сохраняем только контейнер с быстрыми ответами
            const quickRepliesContainer = document.querySelector('.quick-replies-container');
            this.assistantBody.innerHTML = '';
            
            // Добавляем обратно контейнер с быстрыми ответами
            if (quickRepliesContainer) {
                this.assistantBody.parentNode.insertBefore(quickRepliesContainer, this.assistantBody.nextSibling);
            }
            
            localStorage.removeItem("assistantChat");
            this.dialogState = {
                lastTopic: null,
                userName: null,
                userInterests: []
            };
            this.appendMessage("Чат очищен. Чем могу помочь?", "bot");
        }
    }
    
    saveChatHistory() {
        const messages = [];
        this.assistantBody.querySelectorAll(".msg").forEach(msg => {
            if (!msg.classList.contains("typing")) {
                const content = msg.querySelector(".msg-content")?.textContent || "";
                messages.push({
                    text: content,
                    type: msg.classList.contains("user") ? "user" : "bot"
                });
            }
        });
        localStorage.setItem("assistantChat", JSON.stringify(messages));
        localStorage.setItem("assistantState", JSON.stringify(this.dialogState));
    }
    
    loadChatHistory() {
        const savedChat = localStorage.getItem("assistantChat");
        const savedState = localStorage.getItem("assistantState");
        
        if (savedState) {
            this.dialogState = JSON.parse(savedState);
        }
        
        if (savedChat) {
            const messages = JSON.parse(savedChat);
            messages.forEach(msg => {
                this.appendMessage(msg.text, msg.type);
            });
        } else {
            // Welcome message
            this.appendMessage("Привет! Я AI-помощник skelpan. 🤖<br>Могу рассказать о проектах, навыках или просто пообщаться!", "bot");
        }
    }
    
    // Отправка сообщения в Telegram
    async sendToTelegram(message) {
        try {
            const response = await fetch(`https://api.telegram.org/bot8325858714:AAHsipAsY-Q_5SnR-pftMkhUSFYvq7lmhwE/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: '1860716243',
                    text: `Сообщение из ассистента: ${message}`,
                    parse_mode: 'HTML'
                })
            });
            
            return await response.json();
        } catch (error) {
            console.error('Ошибка отправки в Telegram:', error);
        }
    }
}

// Initialize assistant when DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
    new AIAssistant();
});