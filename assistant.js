// AI Assistant with smart responses
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
            }
        };
        
        this.init();
    }
    
    init() {
        // Event listeners
        document.getElementById("assistant-toggle").onclick = () => this.toggleAssistant();
        document.getElementById("mobile-assistant-toggle").onclick = () => this.toggleAssistant();
        this.closeBtn.onclick = () => this.hideAssistant();
        this.sendBtn.onclick = () => this.sendMessage();
        this.clearBtn.onclick = () => this.clearChat();
        this.assistantInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") this.sendMessage();
        });
        
        // Quick replies
        document.querySelectorAll('.quick-reply').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const message = e.target.getAttribute('data-message');
                this.assistantInput.value = message;
                this.sendMessage();
            });
        });
        
        // Load chat history
        this.loadChatHistory();
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
        }, 800 + Math.random() * 800);
    }
    
    generateResponse(message) {
        // Greetings
        if (this.matchPattern(message, ['привет', 'здравств', 'hi', 'hello', 'хай', 'добр'])) {
            return "Привет! 👋 Я AI-помощник skelpan. Рад общению! Чем могу помочь?";
        }
        
        // About
        if (this.matchPattern(message, ['кто ты', 'о себе', 'расскаж', 'about'])) {
            return "Я цифровой помощник skelpan - веб-дизайнера и разработчика. Могу рассказать о проектах, навыках или просто пообщаться! 🚀";
        }
        
        // Projects
        if (this.matchPattern(message, ['проект', 'работ', 'portfolio', 'aniduo', 'podarok', 'block', 'сайт'])) {
            let response = "🎯 Мои проекты:\n\n";
            this.knowledgeBase.projects.forEach(project => {
                response += `• ${project.name}: ${project.description}\n`;
                response += `  🔗 ${project.url}\n`;
                response += `  🛠 ${project.tech.join(', ')}\n\n`;
            });
            return response;
        }
        
        // Skills
        if (this.matchPattern(message, ['навык', 'умение', 'skill', 'технолог', 'stack', 'умеешь'])) {
            return `💪 Мои навыки:\n\n💻 Технические: ${this.knowledgeBase.skills.technical.join(', ')}\n\n❤️ Личностные: ${this.knowledgeBase.skills.personal.join(', ')}\n\n🎮 Интересы: ${this.knowledgeBase.skills.interests.join(', ')}`;
        }
        
        // Contacts
        if (this.matchPattern(message, ['контакт', 'связать', 'telegram', 'tg', 'github', 'почта'])) {
            return `📞 Контакты:\n\n📱 Telegram: ${this.knowledgeBase.contacts.telegram}\n\n🐙 GitHub: ${this.knowledgeBase.contacts.github}\n\n📧 Email: ${this.knowledgeBase.contacts.email}`;
        }
        
        // Games
        if (this.matchPattern(message, ['игр', 'game', 'играешь', 'гейм'])) {
            return "🎮 Обожаю видеоигры! Особенно стратегии, RPG и инди-игры. Люблю обсуждать геймдизайн и интересные механики. А во что играешь ты?";
        }
        
        // Music
        if (this.matchPattern(message, ['музык', 'music', 'тринадцать', 'карат', 'слушаешь'])) {
            return "🎵 Мой любимый исполнитель - 'Тринадцать Карат'! У них глубокая лирика и уникальное звучание. Также слушаю разную альтернативную музыку.";
        }
        
        // Help
        if (this.matchPattern(message, ['помощ', 'help', 'команды', 'что ты умеешь'])) {
            return "🤖 Я могу:\n\n• Рассказать о проектах\n• Показать навыки\n• Дать контакты\n• Поболтать об играх и музыке\n• Ответить на вопросы\n\nПросто спроси о чем угодно!";
        }
        
        // Default response with some intelligence
        const defaultResponses = [
            "Интересный вопрос! Могу рассказать больше о моих проектах или ответить на другие вопросы. 😊",
            "Хороший вопрос! Что еще хочешь узнать? Может быть, о моих навыках или проектах? 🚀",
            "Любопытно! Могу показать примеры работ или рассказать о технологиях, которые использую. 💡",
            "Отличная тема для обсуждения! Давай поговорим о чем-то конкретном - проектах, играх или дизайне? 🎮"
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
        contentDiv.textContent = text;
        msgDiv.appendChild(contentDiv);
        
        // Add quick replies for bot messages
        if (type === "bot") {
            const quickReplies = document.createElement("div");
            quickReplies.className = "quick-replies";
            
            const replies = [
                { text: "💼 Проекты", message: "Расскажи о своих проектах" },
                { text: "🛠 Навыки", message: "Какие у тебя навыки" },
                { text: "📞 Контакты", message: "Как с тобой связаться" }
            ];
            
            replies.forEach(reply => {
                const btn = document.createElement("button");
                btn.className = "quick-reply";
                btn.textContent = reply.text;
                btn.setAttribute("data-message", reply.message);
                btn.addEventListener("click", () => {
                    this.assistantInput.value = reply.message;
                    this.sendMessage();
                });
                quickReplies.appendChild(btn);
            });
            
            msgDiv.appendChild(quickReplies);
        }
        
        this.assistantBody.appendChild(msgDiv);
        this.assistantBody.scrollTop = this.assistantBody.scrollHeight;
    }
    
    showTypingIndicator() {
        const typingDiv = document.createElement("div");
        typingDiv.className = "msg bot typing";
        typingDiv.innerHTML = '<i class="fas fa-ellipsis-h"></i>';
        this.assistantBody.appendChild(typingDiv);
        this.assistantBody.scrollTop = this.assistantBody.scrollHeight;
        this.typingIndicator = typingDiv;
    }
    
    hideTypingIndicator() {
        if (this.typingIndicator && this.typingIndicator.parentElement) {
            this.assistantBody.removeChild(this.typingIndicator);
        }
    }
    
    clearChat() {
        if (confirm("Очистить всю историю чата?")) {
            this.assistantBody.innerHTML = "";
            localStorage.removeItem("assistantChat");
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
    }
    
    loadChatHistory() {
        const savedChat = localStorage.getItem("assistantChat");
        if (savedChat) {
            const messages = JSON.parse(savedChat);
            messages.forEach(msg => {
                this.appendMessage(msg.text, msg.type);
            });
        } else {
            // Welcome message
          //  this.appendMessage("Привет! Я AI-помощник skelpan. 🤖\nМогу рассказать о проектах, навыках или просто пообщаться!", "bot");
        }
    }
}

// Initialize assistant when DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
    new AIAssistant();
});

// Add notification function to global scope
function showNotification(message, type = "success") {
    const notification = document.createElement("div");
    notification.className = `notification ${type === "error" ? "error" : ""}`;
    notification.innerHTML = `
        <i class="fas fa-${type === "success" ? "check-circle" : "exclamation-circle"}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}