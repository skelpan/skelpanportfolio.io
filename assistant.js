// assistant.js
async function getAIResponse(userMessage) {
  try {
    const response = await fetch('/.netlify/functions/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage })
    });
    
    const data = await response.json();
    return data.text;
  } catch (error) {
    // Fallback
    return 'Привет! Напиши в Telegram @skelpan31! 📱';
  }
}