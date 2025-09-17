// Трекер для портфолио
class PortfolioTracker {
  constructor() {
    this.projects = [
      {
        id: 'aniduo',
        name: 'Aniduo',
        url: 'https://skelpan.github.io/aniduo.io/',
        views: 0,
        clicks: 0,
        lastAccessed: null
      },
      {
        id: 'podarok-sistr',
        name: 'Podarok Sistr',
        url: 'https://skelpan.github.io/podaroksustr.io/',
        views: 0,
        clicks: 0,
        lastAccessed: null
      },
      {
        id: 'mr-block',
        name: '_Mr_Block',
        url: 'https://skelpan.github.io/_mr_block_portfolio.io/',
        views: 0,
        clicks: 0,
        lastAccessed: null
      }
    ];
    
    this.init();
  }
  


  
  init() {
    // Загружаем данные из localStorage
    this.loadData();
    
    // Отслеживаем просмотры проектов (при загрузке страницы)
    this.trackProjectViews();
    
    // Отслеживаем клики по проектам
    this.trackProjectClicks();
    
    // Сохраняем данные при закрытии страницы
    window.addEventListener('beforeunload', () => {
      this.saveData();
      this.sendDataToServer();
    });
  }
  
  loadData() {
    const savedData = localStorage.getItem('portfolioData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      this.projects = parsedData.projects || this.projects;
    }
  }
  
  saveData() {
    const dataToSave = {
      projects: this.projects,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('portfolioData', JSON.stringify(dataToSave));
  }
  
  trackProjectViews() {
    // Определяем, какой проект просматривается
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('project');
    
    if (projectId) {
      const project = this.projects.find(p => p.id === projectId);
      if (project) {
        project.views++;
        project.lastAccessed = new Date().toISOString();
        this.saveData();
      }
    }
  }
  
  trackProjectClicks() {
    // Отслеживаем клики по ссылкам проектов
    document.querySelectorAll('.project-link').forEach(link => {
      link.addEventListener('click', (e) => {
        const projectUrl = e.currentTarget.href;
        const project = this.projects.find(p => p.url === projectUrl);
        
        if (project) {
          project.clicks++;
          project.lastAccessed = new Date().toISOString();
          this.saveData();
          
          // Отправляем данные сразу после клика
          this.sendDataToServer();
        }
      });
    });
  }
  
  async sendDataToServer() {
    try {
      // Используем TelegramSender для отправки данных
      if (window.telegramSender) {
        const message = window.telegramSender.formatProjectStats(this.projects);
        await window.telegramSender.sendMessage(message);
        console.log('Данные портфолио отправлены в Telegram');
      }
    } catch (error) {
      console.error('Ошибка отправки данных портфолио:', error);
    }
  }
  
  getProjectStats(projectId) {
    return this.projects.find(p => p.id === projectId);
  }
  
  getAllStats() {
    return this.projects;
  }
}

// Инициализация трекера портфолио
document.addEventListener('DOMContentLoaded', function() {
  window.portfolioTracker = new PortfolioTracker();
});