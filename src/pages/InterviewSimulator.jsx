import { useState, useEffect, useRef } from 'react';
import { interviewTurn, getCustomApiKey, setCustomApiKey } from '../utils/aiService';

const TOPICS = [
  { id: 'all', title: '🎲 Комплексное собеседование', desc: 'Вопросы по всем ключевым темам бэкенда' },
  { id: 'python', title: '🐍 Основы Python & ООП', desc: 'Типы данных, декораторы, генераторы, GIL, ООП' },
  { id: 'fastapi', title: '⚡ FastAPI & Асинхронность', desc: 'Pydantic, Dependency Injection, async/await, роуты' },
  { id: 'db', title: '🗄️ Базы данных & ORM', desc: 'PostgreSQL, SQLAlchemy, индексы, транзакции, N+1' },
  { id: 'architecture', title: '🧠 Архитектура & DevOps', desc: 'Docker, Redis кэш, Celery, JWT безопасность' },
];

const GRADES = [
  { id: 'junior', title: 'Junior Backend Dev', desc: 'Базовые понятия, синтаксис, типовые ошибки' },
  { id: 'middle', title: 'Middle Backend Dev', desc: 'Узкие места, масштабирование, архитектура, оптимизация' },
];

// Резервные вопросы для режима без подключенного AI-ключа
const OFFLINE_QUESTIONS = {
  python: [
    'Расскажи, чем список (list) в Python отличается от кортежа (tuple) и когда что лучше использовать?',
    'Как работает генератор с ключевым словом yield и почему он экономит оперативную память?',
    'Что такое декоратор в Python и как написать свой собственный декоратор для замера времени выполнения функции?',
  ],
  fastapi: [
    'В чём разница между объявлением эндпоинта через `async def` и обычным `def` в FastAPI?',
    'Как устроен механизм Dependency Injection (Depends) в FastAPI и зачем он нужен?',
    'Как Pydantic валидирует входные данные и что вернётся клиенту при несовпадении типов?',
  ],
  db: [
    'Что такое транзакция в базе данных и какие гарантии даёт стандарт ACID?',
    'Как индекс B-Tree ускоряет поиск по таблице и когда добавление индекса может навредить?',
    'Что такое проблема N+1 запросов в SQLAlchemy и как её решить с помощью joinedload / selectinload?',
  ],
  architecture: [
    'Чем аутентификация отличается от авторизации? Как работает JWT-токен?',
    'Как паттерн Cache-Aside работает в связке с Redis и как бороться с устареванием данных (TTL)?',
    'Зачем нужны очереди задач Celery и брокер Redis, если можно запустить фоновый поток thread?',
  ],
  all: [
    'Расскажи о полном пути HTTP-запроса от нажатия кнопки в браузере до строки в базе данных PostgreSQL.',
    'Как ты организуешь обработку ошибок в продакшене, чтобы сервер не отдавал 500 клиенту?',
    'Как ты обеспечиваешь безопасность своего API от типичных атак (SQLi, Brute-force, CORS)?',
  ],
};

export default function InterviewSimulator() {
  const [grade, setGrade] = useState('junior');
  const [topic, setTopic] = useState('all');
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [offlineIdx, setOfflineIdx] = useState(0);

  const [showKeyModal, setShowKeyModal] = useState(false);
  const [customKeyInput, setCustomKeyInput] = useState(getCustomApiKey());

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const startInterview = async () => {
    setStarted(true);
    setMessages([]);
    setIsLoading(true);
    setOfflineMode(false);
    setOfflineIdx(0);

    const initialPrompt = [
      {
        role: 'user',
        content: `Привет! Я готов к собеседованию на позицию ${grade === 'junior' ? 'Junior' : 'Middle'} Python Backend разработчика по теме "${TOPICS.find((t) => t.id === topic)?.title}". Задай мне первый вводный вопрос!`,
      },
    ];

    const res = await interviewTurn({
      messages: initialPrompt,
      grade,
      topic,
    });

    if (res.ok) {
      setMessages([
        {
          role: 'assistant',
          content: res.message,
        },
      ]);
    } else {
      // Режим офлайн-вопросника
      setOfflineMode(true);
      const qList = OFFLINE_QUESTIONS[topic] || OFFLINE_QUESTIONS.all;
      setMessages([
        {
          role: 'assistant',
          content: `Привет! Я твой виртуальный интервьюер на грейд ${grade.toUpperCase()}.\n\n⚠️ AI API-ключ не обнаружен, работаем в режиме банка вопросов курса. Ты можешь отвечать на вопросы, а подключив ключ в настройках — получать живую рецензию нейросети.\n\n👉 **Вопрос 1:** ${qList[0]}`,
        },
      ]);
    }
    setIsLoading(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputVal.trim() || isLoading) return;

    const userText = inputVal.trim();
    setInputVal('');

    const newHistory = [...messages, { role: 'user', content: userText }];
    setMessages(newHistory);
    setIsLoading(true);

    if (offlineMode) {
      setTimeout(() => {
        const qList = OFFLINE_QUESTIONS[topic] || OFFLINE_QUESTIONS.all;
        const nextIdx = offlineIdx + 1;
        setOfflineIdx(nextIdx);

        let nextMsg = '';
        if (nextIdx < qList.length) {
          nextMsg = `👍 Ответ зафиксирован!\n\n👉 **Вопрос ${nextIdx + 1}:** ${qList[nextIdx]}`;
        } else {
          nextMsg = `🎉 Отлично, ты ответил на все вопросы базового блока собеседования по теме "${TOPICS.find((t) => t.id === topic)?.title}"! Подключи OpenRouter ключ, чтобы разобрать тонкости ответов с живой моделью.`;
        }

        setMessages([...newHistory, { role: 'assistant', content: nextMsg }]);
        setIsLoading(false);
      }, 700);
      return;
    }

    const res = await interviewTurn({
      messages: newHistory,
      grade,
      topic,
    });

    if (res.ok) {
      setMessages([...newHistory, { role: 'assistant', content: res.message }]);
    } else {
      setMessages([
        ...newHistory,
        {
          role: 'assistant',
          content: `⚠️ Не удалось связаться с AI (${res.error || 'Ошибка'}). Проверь API-ключ в настройках.`,
        },
      ]);
    }
    setIsLoading(false);
  };

  const handleSaveKey = (e) => {
    e.preventDefault();
    setCustomApiKey(customKeyInput);
    setShowKeyModal(false);
  };

  return (
    <div className="mx-auto max-w-4xl animate-fade-in px-4 py-8 sm:px-6 sm:py-10">
      {/* Шапка */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-3xl">🎙️</span>
            <h1 className="text-2xl font-bold sm:text-3xl" style={{ color: 'var(--text-primary)' }}>
              Тренажёр собеседования
            </h1>
          </div>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Интерактивный симулятор технического интервью с опытным Team Lead (на базе AI).
          </p>
        </div>

        <button
          onClick={() => setShowKeyModal(true)}
          className="self-start rounded-xl border px-3 py-1.5 text-xs font-medium transition hover:bg-[var(--bg-hover)] sm:self-center"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
        >
          ⚙️ Настроить API-ключ
        </button>
      </div>

      {/* Экран выбора темы и сложности перед стартом */}
      {!started && (
        <div className="space-y-6 rounded-2xl border p-6" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              1. Выбери уровень сложности (Грейд):
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              {GRADES.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGrade(g.id)}
                  className="rounded-xl border p-4 text-left transition"
                  style={{
                    background: grade === g.id ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : 'var(--bg)',
                    borderColor: grade === g.id ? 'var(--accent)' : 'var(--border)',
                  }}
                >
                  <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                    {g.title}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {g.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              2. Выбери тему собеседования:
            </label>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {TOPICS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTopic(t.id)}
                  className="rounded-xl border p-3.5 text-left transition"
                  style={{
                    background: topic === t.id ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : 'var(--bg)',
                    borderColor: topic === t.id ? 'var(--accent)' : 'var(--border)',
                  }}
                >
                  <p className="font-semibold text-xs sm:text-sm" style={{ color: 'var(--text-primary)' }}>
                    {t.title}
                  </p>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    {t.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={startInterview}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white shadow-lg transition hover:brightness-110"
              style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' }}
            >
              <span>🚀 Начать собеседование</span>
            </button>
          </div>
        </div>
      )}

      {/* Чат собеседования */}
      {started && (
        <div className="flex flex-col rounded-2xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
          {/* Верхняя статус-плашка */}
          <div className="flex items-center justify-between border-b px-5 py-3 text-xs" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
              <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                {GRADES.find((g) => g.id === grade)?.title} • {TOPICS.find((t) => t.id === topic)?.title}
              </span>
            </div>
            <button
              onClick={() => setStarted(false)}
              className="rounded-lg px-2.5 py-1 transition hover:bg-[var(--bg-hover)]"
              style={{ color: 'var(--text-muted)' }}
            >
              Завершить
            </button>
          </div>

          {/* Сообщения диалога */}
          <div className="flex min-h-[420px] max-h-[560px] flex-col gap-4 overflow-y-auto p-5">
            {messages.map((msg, idx) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div
                  key={idx}
                  className={`flex gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                >
                  {isAssistant && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-base">
                      👨‍💻
                    </div>
                  )}
                  <div
                    className="max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap shadow-sm"
                    style={{
                      background: isAssistant ? 'var(--bg)' : 'var(--accent)',
                      color: isAssistant ? 'var(--text-primary)' : '#ffffff',
                      border: isAssistant ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    {msg.content}
                  </div>
                  {!isAssistant && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 text-base">
                      🎓
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/20 text-base">
                  👨‍💻
                </div>
                <div
                  className="rounded-2xl border p-3.5 text-xs italic"
                  style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                >
                  Интервьюер слушает и формулирует фидбек... ✍️
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Поле ввода ответа */}
          <form onSubmit={handleSendMessage} className="border-t p-3.5" style={{ borderColor: 'var(--border)' }}>
            <div className="flex gap-2">
              <textarea
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                rows={2}
                placeholder="Напиши свой ответ (Enter — отправить, Shift+Enter — перенос строки)..."
                className="w-full resize-none rounded-xl border p-3 text-xs sm:text-sm outline-none transition"
                style={{
                  background: 'var(--bg)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
              <button
                type="submit"
                disabled={!inputVal.trim() || isLoading}
                className="flex items-center justify-center rounded-xl px-4 text-xs font-bold text-white transition disabled:opacity-50"
                style={{ background: 'var(--accent)' }}
              >
                Отправить
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Модалка настроек ключа */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div
            className="w-full max-w-md rounded-2xl border p-6 shadow-2xl"
            style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
          >
            <h3 className="mb-2 text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              🔑 OpenRouter API-ключ
            </h3>
            <p className="mb-4 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Укажите ключ OpenRouter (<code>sk-or-v1-...</code>) для включения живого AI-собеседования. Ключ хранится строго в вашем браузере.
            </p>

            <form onSubmit={handleSaveKey} className="space-y-3">
              <input
                type="password"
                placeholder="sk-or-v1-..."
                value={customKeyInput}
                onChange={(e) => setCustomKeyInput(e.target.value)}
                className="w-full rounded-xl border px-3.5 py-2 font-mono text-xs outline-none"
                style={{
                  background: 'var(--bg-secondary)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="rounded-xl border px-4 py-2 text-xs font-medium transition"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="rounded-xl px-4 py-2 text-xs font-bold text-white transition"
                  style={{ background: 'var(--accent)' }}
                >
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
