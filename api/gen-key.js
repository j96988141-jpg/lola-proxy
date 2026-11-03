const crypto = require('crypto');

// In-memory storage (Production ke liye Database/Redis use karein)
// Structure: Map<Key, { batchId, telegramId, createdAt }>
global.validKeys = global.validKeys || new Map();

module.exports = (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // URL Path se batch_id aur user_telegram_chat_id nikalna
  // Format: /api/gen-key/{batch_id}/{user_telegram_chat_id}
  const parts = req.url.split('?')[0].split('/');
  const batchId = parts[3];
  const telegramId = parts[4];

  if (!batchId || !telegramId) {
    return res.status(400).json({ 
      error: 'Invalid URL format. Use: /api/gen-key/{batch_id}/{user_telegram_chat_id}' 
    });
  }

  // Unique Secure Key Generate karna
  const rawData = `${batchId}-${telegramId}-${Date.now()}-${Math.random()}`;
  const apiKey = crypto.createHash('sha256').update(rawData).digest('hex');

  // Key ko store karein sath me metadata (batchId & telegramId)
  global.validKeys.set(apiKey, {
    batchId,
    telegramId,
    createdAt: Date.now()
  });

  return res.status(200).json({
    success: true,
    message: 'API Key generated successfully',
    batch_id: batchId,
    telegram_chat_id: telegramId,
    api_key: apiKey,
    usage_header: 'x-api-key'
  });
};
