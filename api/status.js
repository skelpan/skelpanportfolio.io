// api/status.js
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({ 
    status: 'OK', 
    aiEnabled: true,
    provider: 'DeepSeek'
  });
};