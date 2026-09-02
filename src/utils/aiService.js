// Client AI Service: calls local Vite backend proxy /api/ai/chat

export function getCustomApiKey() {
  return localStorage.getItem('backend_course_openrouter_key') || '';
}

export function setCustomApiKey(key) {
  if (!key) {
    localStorage.removeItem('backend_course_openrouter_key');
  } else {
    localStorage.setItem('backend_course_openrouter_key', key.trim());
  }
}

export async function requestAiChat({ systemPrompt, prompt, messages, model, temperature, maxTokens }) {
  const customKey = getCustomApiKey();
  const headers = {
    'Content-Type': 'application/json',
  };
  if (customKey) {
    headers['x-openrouter-key'] = customKey;
  }

  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        systemPrompt,
        prompt,
        messages,
        model: model || 'openai/gpt-4o-mini',
        temperature: temperature ?? 0.7,
        maxTokens: maxTokens ?? 1200,
      }),
    });

    if (!res.ok) {
      return {
        ok: false,
        code: 'NETWORK_ERROR',
        error: 'Ошибка сети при обращении к серверу AI',
      };
    }

    const data = await res.json();
    return data;
  } catch (err) {
    return {
      ok: false,
      code: 'FETCH_FAILED',
      error: `Не удалось связаться с сервером: ${err.message}`,
    };
  }
}

/**
 * 1. AI Code Reviewer: отзывчивый фидбек по коду в песочнице
 */
export async function reviewPythonCode({ code, description, output, error }) {
  const systemPrompt = `Ты опытный, доброжелательный и практичный backend-наставник по Python и FastAPI.
Твоя задача — дать короткий, поддерживающий и точный фидбек начинающему ученику по его коду.
Формат ответа:
1. 🌟 Что сделано отлично (1-2 пункта)
2. 💡 Что можно улучшить или оптимизировать (без духоты и академизма, только важная практика)
3. 🚀 Совет на будущее (1 краткая мысль)
Пиши простым языком, на русском, без длинных простыней текста. Используй эмодзи и markdown.`;

  const userPrompt = `Посмотри мой код:
\`\`\`python
${code}
\`\`\`

Контекст задания: ${description || 'Самостоятельное упражнение'}
${output ? `Вывод в терминале:\n${output}` : ''}
${error ? `Ошибка исполнения:\n${error}` : ''}`;

  return requestAiChat({
    systemPrompt,
    prompt: userPrompt,
    temperature: 0.6,
  });
}

/**
 * 2. AI Interviewer: диалог на техническом собеседовании
 */
export async function interviewTurn({ messages, grade, topic }) {
  const systemPrompt = `Ты профессиональный и доброжелательный Team Lead / Senior Backend Engineer, проводящий техническое собеседование с кандидатом на позицию Python Backend Developer (Уровень: ${grade}, Тема: ${topic}).
Твои правила:
1. Оценивай каждый ответ кандидата: скажи, что было верно, а что стоило добавить.
2. Ставь оценку ответу (например: "Отлично 5/5", "Хорошо 4/5", "Нужно дополнить 3/5").
3. Задавай СТРОГО ОДИН следующий логичный вопрос по теме (нарастающая сложность).
4. Держи тон дружелюбным, мотивирующим и профессиональным. Пиши на русском языке.`;

  return requestAiChat({
    systemPrompt,
    messages,
    temperature: 0.7,
  });
}

/**
 * 3. AI System Design Evaluator: оценка собранной архитектуры
 */
export async function evaluateSystemDesignArchitecture({ taskTitle, taskRequirements, nodes, connections }) {
  const systemPrompt = `Ты Principal Backend Architect. Твоя задача — оценить предложенную начинающим разработчиком архитектуру системы (System Design) для задачи "${taskTitle}".
Правила:
1. Оцени понятность и достаточность компонентов.
2. Проверь наличие единых точек отказа (Single Point of Failure), масштабируемость и кэширование.
3. Дай вердикт: "Сильные стороны", "Узкие места (Bottlenecks)" и "Рекомендации по улучшению".
Пиши доступно, с жизненными примерами и без лишней теории.`;

  const userPrompt = `Задача: ${taskTitle}
Требования к системе: ${taskRequirements}

Компоненты на холсте (${nodes.length} шт.):
${nodes.map((n) => `- [${n.type.toUpperCase()}]: ${n.label} (ID: ${n.id})`).join('\n')}

Связи между компонентами (${connections.length} шт.):
${connections.map((c) => `- ${c.fromLabel} ➔ ${c.toLabel} (${c.protocol || 'HTTP/TCP'})`).join('\n')}

Дай краткую объективную оценку этой архитектуры.`;

  return requestAiChat({
    systemPrompt,
    prompt: userPrompt,
    temperature: 0.7,
  });
}
