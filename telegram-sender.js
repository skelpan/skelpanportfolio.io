// Отправка данных в Telegram
class TelegramSender {
  constructor(botToken, chatId) {
    this.botToken = botToken || '8325858714:AAHsipAsY-Q_5SnR-pftMkhUSFYvq7lmhwE';
    this.chatId = chatId || '1860716243';
    this.apiUrl = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
  }
  
  async sendMessage(text, parseMode = 'HTML') {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: this.chatId,
          text: text,
          parse_mode: parseMode
        })
      });
      
      const data = await response.json();
      
      if (data.ok) {
        console.log('Сообщение отправлено в Telegram');
        return true;
      } else {
        console.error('Ошибка отправки в Telegram:', data);
        return false;
      }
    } catch (error) {
      console.error('Ошибка отправки в Telegram:', error);
      return false;
    }
  }
  
  formatVisitorData(visitorData) {
    return `
<b>Новый посетитель на сайте</b> 🎉

<b>Общая информация:</b>
👀 Посещений: ${visitorData.visits}
⏱️ Время на сайте: ${Math.round(visitorData.timeSpent / 60)} минут
📅 Первый визит: ${new Date(visitorData.firstVisit).toLocaleDateString('ru-RU')}
🔄 Взаимодействий: ${visitorData.interactions}

<b>Устройство:</b>
${visitorData.deviceInfo.userAgent}
🌐 Язык: ${visitorData.deviceInfo.language}
🖥️ Разрешение: ${visitorData.deviceInfo.screenWidth}x${visitorData.deviceInfo.screenHeight}
📍 Часовой пояс: ${visitorData.deviceInfo.timezone}

<b>Просмотренные страницы:</b>
${visitorData.pagesViewed.map(page => `• ${page}`).join('\n')}
    `;
  }
  
  formatProjectStats(projectStats) {
    let message = '<b>Статистика по проектам</b> 📊\n\n';
    
    projectStats.forEach(project => {
      message += `
<b>${project.name}</b>
👀 Просмотров: ${project.views}
🖱️ Кликов: ${project.clicks}
📅 Последний доступ: ${project.lastAccessed ? new Date(project.lastAccessed).toLocaleDateString('ru-RU') : 'Никогда'}
      `;
    });
    
    return message;
  }
  
  formatContactFormData(formData) {
    return `
<b>Новое сообщение с сайта</b> ✉️

<b>От:</b> ${formData.name}
<b>Email:</b> ${formData.email}
<b>Время:</b> ${formData.timestamp}

<b>Сообщение:</b>
${formData.message}
    `;
  }
}




