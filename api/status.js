module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.DEEPSEEK_API_KEY || 'sk-f74b7299149347dfa8086b70ce793f56';
    const isAIEnabled = !!apiKey;
    const isValidKey = apiKey && apiKey.startsWith('sk-') && apiKey.length > 10;

    // Простая проверка ключа
    let keyStatus = 'invalid';
    if (isValidKey) {
      keyStatus = 'valid';
    }

    res.json({ 
      status: 'OK', 
      server: 'Vercel',
      aiEnabled: isAIEnabled && isValidKey,
      apiKeyValid: isValidKey,
      apiKeyStatus: keyStatus,
      aiProvider: 'DeepSeek',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production'
    });

  } catch (error) {
    console.error('Status check error:', error);
    
    res.status(500).json({ 
      status: 'error',
      aiEnabled: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};