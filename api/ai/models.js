// Vercel Serverless Function: список моделей OpenRouter для выпадающего меню.
// Продакшен-аналог /api/ai/models из vite.config.js (см. комментарий в chat.js).

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, code: 'METHOD_NOT_ALLOWED', error: 'Только GET' });
    return;
  }

  try {
    const apiRes = await fetch('https://openrouter.ai/api/v1/models');
    const apiData = await apiRes.json();

    if (!apiRes.ok) {
      res.status(200).json({ ok: false, code: 'API_ERROR', error: 'Не удалось получить список моделей' });
      return;
    }

    const models = (apiData.data || [])
      .map((m) => ({
        id: m.id,
        name: m.name || m.id,
        context_length: m.context_length,
        prompt_price: m.pricing?.prompt,
        completion_price: m.pricing?.completion,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    res.status(200).json({ ok: true, models });
  } catch (err) {
    res.status(200).json({ ok: false, code: 'SERVER_ERROR', error: err.message });
  }
}
