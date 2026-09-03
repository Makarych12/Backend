// Vercel Serverless Function: проксирует чат AI-наставника в OpenRouter.
// Локально в dev-режиме тот же путь ('/api/ai/chat') обслуживает
// aiProxyPlugin из vite.config.js — эта функция нужна только для продакшена
// на Vercel, где кастомный middleware Vite не работает.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, code: 'METHOD_NOT_ALLOWED', error: 'Только POST' });
    return;
  }

  try {
    const data = req.body || {};
    const serverKey = process.env.OPENROUTER_API_KEY;
    const clientKey = req.headers['x-openrouter-key'];
    const apiKey = serverKey || clientKey;

    if (!apiKey || apiKey.trim() === '') {
      res.status(200).json({
        ok: false,
        code: 'NO_API_KEY',
        error: 'AI-функция временно недоступна, добавьте API-ключ в настройках',
      });
      return;
    }

    const model = data.model || 'openai/gpt-4o-mini';
    const messages = [];
    if (data.systemPrompt) {
      messages.push({ role: 'system', content: data.systemPrompt });
    }
    if (Array.isArray(data.messages)) {
      messages.push(...data.messages);
    } else if (data.prompt) {
      messages.push({ role: 'user', content: data.prompt });
    }

    const apiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
        'HTTP-Referer': 'https://backend-course.vercel.app',
        'X-Title': 'Backend Interactive Course',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: data.temperature ?? 0.7,
        max_tokens: data.maxTokens ?? 1200,
      }),
    });

    const apiData = await apiRes.json();

    if (!apiRes.ok || apiData.error) {
      const errMsg = apiData.error?.message || 'Ошибка вызова AI API';
      res.status(200).json({ ok: false, code: 'API_ERROR', error: errMsg });
      return;
    }

    const content = apiData.choices?.[0]?.message?.content || '';
    res.status(200).json({ ok: true, message: content });
  } catch (err) {
    res.status(200).json({ ok: false, code: 'SERVER_ERROR', error: err.message });
  }
}
