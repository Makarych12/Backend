// Client AI Service: calls local Vite backend proxy /api/ai/chat

const DEFAULT_MODEL = 'openai/gpt-4o-mini';

// Ключ OpenRouter больше не хранится в браузере — удаляем то, что могло
// остаться там от старой версии интерфейса, где было поле для личного ключа.
localStorage.removeItem('backend_course_openrouter_key');

export function getSelectedModel() {
  return localStorage.getItem('backend_course_openrouter_model') || DEFAULT_MODEL;
}

export function setSelectedModel(modelId) {
  if (!modelId) {
    localStorage.removeItem('backend_course_openrouter_model');
  } else {
    localStorage.setItem('backend_course_openrouter_model', modelId.trim());
  }
}

/**
 * Загружает список доступных моделей OpenRouter через локальный proxy /api/ai/models
 */
export async function fetchAvailableModels() {
  try {
    const res = await fetch('/api/ai/models');
    if (!res.ok) {
      return { ok: false, error: 'Ошибка сети при получении списка моделей' };
    }
    const data = await res.json();
    return data;
  } catch (err) {
    return { ok: false, error: `Не удалось связаться с сервером: ${err.message}` };
  }
}

export async function requestAiChat({ systemPrompt, prompt, messages, model, temperature, maxTokens }) {
  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemPrompt,
        prompt,
        messages,
        model: model || getSelectedModel(),
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

export const AI_ROLES = {
  tutor: {
    id: 'tutor',
    title: 'AI-Репетитор',
    icon: '🎓',
    badge: 'Объяснение темы',
    description: 'Объяснит любой урок простыми словами с жизненными аналогиями',
    systemPrompt: `Ты заботливый, остроумный и понятный AI-репетитор по бэкенду на Python и FastAPI.
Твоя задача — объяснить концепцию из урока максимально просто, как для начинающего или 10-летнего ребёнка.
Правила:
1. Используй яркие бытовые аналогии (котики, пицца, конструктор Лего, заказ в ресторане).
2. Объясняй короче и проще официальной документации.
3. Приводи 1 компактный и наглядный пример кода, если уместно.
4. Будь доброжелательным и вдохновляющим. Пиши на русском языке.`,
  },

  reviewer: {
    id: 'reviewer',
    title: 'AI-Ревьюер кода',
    icon: '👨‍💻',
    badge: 'Code Review',
    description: 'Senior-разработчик проверит твой код, стиль и архитектуру',
    systemPrompt: `Ты опытный, доброжелательный Senior Backend Developer.
Твоя задача — дать качественное, поддерживающее код-ревью ученику:
1. 🌟 Что сделано отлично (1-2 пункта).
2. 💡 Что можно оптимизировать или улучшить по PEP 8 / архитектуре (без духоты, только важное).
3. 🚀 Совет на будущее.
Пиши структурированно, дружелюбно, на русском языке.`,
  },

  error_explainer: {
    id: 'error_explainer',
    title: 'AI-Объяснятель ошибок',
    icon: '🔍',
    badge: 'Дебаг ошибок',
    description: 'Переведёт Traceback на человеческий язык и подскажет решение',
    systemPrompt: `Ты эксперт по отладке кода и доброжелательный наставник.
Когда ученик получает ошибку в Python:
1. 🛑 Что случилось простыми словами (переведи суть ошибки на русский без заумных терминов).
2. 📍 Где именно и почему возникла эта ошибка.
3. 🛠️ Как это исправить — дай понятную подсказку или наводящий вопрос, чтобы ученик сам осознал решение.`,
  },

  interviewer: {
    id: 'interviewer',
    title: 'AI-Интервьюер',
    icon: '🎙️',
    badge: 'Собеседование',
    description: 'Тренажёр реального технического интервью с оценкой ответов',
    systemPrompt: `Ты Team Lead / Senior Backend Engineer, проводящий техническое собеседование с кандидатом на позицию Python Backend Developer.
1. Оценивай каждый ответ кандидата: скажи, что было верно, а что стоило дополнить.
2. Ставь оценку ответу (например: "Отлично 5/5", "Хорошо 4/5", "Нужно дополнить 3/5").
3. Задавай СТРОГО ОДИН следующий логичный вопрос по теме (нарастающая сложность).
4. Держи тон дружелюбным, мотивирующим и профессиональным. Пиши на русском языке.`,
  },

  navigator: {
    id: 'navigator',
    title: 'AI-Навигатор',
    icon: '🧭',
    badge: 'План обучения',
    description: 'Персональный трек: что делать дальше и на чём сфокусироваться',
    systemPrompt: `Ты персональный карьерный и учебный ментор курса по Backend разработке.
На основе прогресса ученика (завершённых модулей и тем):
1. Оцени текущий прогресс и похвали за успехи.
2. Дай 2-3 конкретных шага: какой урок/проект пройти следующим, что повторить.
3. Сформулируй главный фокус для закрепления навыков сегодня.`,
  },

  practice_generator: {
    id: 'practice_generator',
    title: 'Генератор практики',
    icon: '🎯',
    badge: 'Доп. упражнения',
    description: 'Создаст новое уникальное задание для закрепления темы',
    systemPrompt: `Ты автор практических задач по Python и бэкенду.
Твоя цель — сгенерировать ОДНО свежее, интересное практическое задание по запрошенной теме:
1. 📝 Формулировка задачи из реальной жизни.
2. 💡 Скрытая подсказка.
3. 🧪 Способ самопроверки (код с print/assert для песочницы).
Не делай задачи слишком сложными, держи их интересными и прикладными.`,
  },

  english_companion: {
    id: 'english_companion',
    title: 'English Companion',
    icon: '🇬🇧',
    badge: 'Technical English',
    description: 'Практика английских рабочих диалогов для созвонов и код-ревью',
    systemPrompt: `You are Alex, a friendly Senior Backend Engineer at an international tech company.
You are having a casual workplace chat with the student in English.
Topic situations: daily standup, explaining a bug, requesting code review, discussing architecture.
Rules:
1. Always reply in clear, natural, spoken English (2-4 sentences max).
2. Ask an engaging follow-up question to keep the conversation going.
3. If the student made an English grammar/vocabulary mistake, gently add a short helpful tip at the end in Russian:
"💡 Совет по английскому: [friendly correction in Russian]"`,
  },
};

/**
 * Единый вызов диалога с AI-наставником
 */
export async function mentorChatTurn({ roleId = 'tutor', messages, context = '' }) {
  const roleMeta = AI_ROLES[roleId] || AI_ROLES.tutor;
  let systemPrompt = roleMeta.systemPrompt;
  if (context) {
    systemPrompt += `\n\n--- ТЕКУЩИЙ КОНТЕКСТ СТРАНИЦЫ/УРОКА ---\n${context}`;
  }

  return requestAiChat({
    systemPrompt,
    messages,
    temperature: roleId === 'english_companion' ? 0.8 : 0.6,
  });
}

/**
 * Ревью кода из песочницы
 */
export async function reviewPythonCode({ code, description, output, error }) {
  const context = `Код ученика:\n\`\`\`python\n${code}\n\`\`\`\n\nЗадание: ${description || 'Упражнение'}\nВывод: ${output || '(пусто)'}\nОшибка: ${error || '(нет)'}`;
  return mentorChatTurn({
    roleId: 'reviewer',
    messages: [{ role: 'user', content: 'Пожалуйста, проведи ревью моего кода.' }],
    context,
  });
}

/**
 * AI Interviewer
 */
export async function interviewTurn({ messages, grade, topic }) {
  const context = `Грейд: ${grade || 'Junior'}, Тема: ${topic || 'Все темы'}`;
  return mentorChatTurn({
    roleId: 'interviewer',
    messages,
    context,
  });
}

/**
 * AI System Design Evaluator
 */
export async function evaluateSystemDesignArchitecture({ taskTitle, taskRequirements, nodes, connections }) {
  const systemPrompt = `Ты Principal Backend Architect. Оцени архитектуру System Design для задачи "${taskTitle}":
1. Оцени понятность и достаточность компонентов.
2. Проверь наличие единых точек отказа (SPOF) и кэширование.
3. Дай вердикт: Сильные стороны, Узкие места, Рекомендации.`;

  const userPrompt = `Задача: ${taskTitle}\nТребования: ${taskRequirements}\n\nКомпоненты:\n${nodes.map((n) => `- [${n.type.toUpperCase()}]: ${n.label}`).join('\n')}\n\nСвязи:\n${connections.map((c) => `- ${c.fromLabel} ➔ ${c.toLabel} (${c.protocol})`).join('\n')}`;

  return requestAiChat({
    systemPrompt,
    prompt: userPrompt,
    temperature: 0.7,
  });
}
