// api/proxy.js — Proxy genérico para todas as APIs dos Correios
// O frontend envia: { url: 'https://apihom.correios.com.br/...', method, body }
// Este serverless repassa server-side, sem CORS

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, x-correios-env');
    return res.status(200).end();
  }

  const { targetUrl, method = 'GET', body } = req.body || {};
  const authHeader = req.headers['authorization'];

  if (!targetUrl) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(400).json({ error: 'targetUrl é obrigatório' });
  }

  // Whitelist de segurança: só permite chamar domínios dos Correios
  const allowedDomains = [
    'apihom.correios.com.br',
    'api.correios.com.br',
    'cwshom.correios.com.br',
    'cws.correios.com.br',
  ];
  const urlObj = new URL(targetUrl);
  if (!allowedDomains.includes(urlObj.hostname)) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(403).json({ error: 'Domínio não permitido: ' + urlObj.hostname });
  }

  try {
    const fetchOptions = {
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(authHeader ? { 'Authorization': authHeader } : {}),
      },
    };

    if (body && method.toUpperCase() !== 'GET') {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const correiosResp = await fetch(targetUrl, fetchOptions);
    const contentType = correiosResp.headers.get('content-type') || '';

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', contentType || 'application/json');

    // Retornar binário se for PDF
    if (contentType.includes('pdf') || contentType.includes('octet-stream')) {
      const buffer = await correiosResp.arrayBuffer();
      res.status(correiosResp.status);
      return res.send(Buffer.from(buffer));
    }

    const text = await correiosResp.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    return res.status(correiosResp.status).json(data);

  } catch (err) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(502).json({
      error: 'Proxy error',
      message: err.message,
    });
  }
}
