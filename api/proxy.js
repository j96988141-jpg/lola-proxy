const fetch = require('node-fetch');

// Access global valid keys from gen-key.js
const validKeys = global.validKeys || new Map();

module.exports = async (req, res) => {
  // Header se API key check karein
  const apiKey = req.headers['x-api-key'] || req.headers['authorization'];

  if (!apiKey || !validKeys.has(apiKey)) {
    return res.status(401).json({ 
      error: 'Unauthorized Access: Invalid or missing API key.' 
    });
  }

  // Key data fetch karein (Optional: aap batchId verify bhi kar sakte hain)
  const keyData = validKeys.get(apiKey);

  try {
    // Target Original Cloudflare Worker API URL
    const targetUrl = 'https://api.pwmarco1.workers.dev' + (req.url.replace('/api/proxy', '') || '');

    // Request ko forward karein original API par
    const apiResponse = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        // Agar original API ko bhi koi secret chahiye toh yaha add kar sakte hain
      },
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body)
    });

    const data = await dataToJsonOrText(apiResponse);
    
    return res.status(apiResponse.status).send(data);
  } catch (error) {
    console.error('Proxy Error:', error);
    return res.status(500).json({ error: 'Internal Server Error via Proxy' });
  }
};

async function dataToJsonOrText(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    return text;
  }
}
