// api/token.js — Proxy para geração de token dos Correios
// Resolve CORS: o browser chama /api/token, que chama a API dos Correios server-side

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Pega o env do header customizado, ou 'hom' como padrão
  const env = req.headers['x-correios-env'] === 'prod' ? 'prod' : 'hom';
  const authHeader = req.headers['authorization'];

  const BASE = env === 'prod'
    ? 'https://api.correios.com.br'
    : 'https://apihom.correios.com.br';

  try {
    const correiosResp = await fetch(`${BASE}/token/v1/autentica/cartaopostagem`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(authHeader ? { 'Authorization': authHeader } : {}),
      },
      body: JSON.stringify(req.body),
    });

    const text = await correiosResp.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    return res.status(correiosResp.status).json(data);

  } catch (err) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(502).json({
      error: 'Proxy error',
      message: err.message,
      detail: 'Falha ao conectar na API dos Correios'
    });
  }
}
