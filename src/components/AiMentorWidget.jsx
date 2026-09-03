import { useState, useRef, useEffect } from 'react';
import { useAiMentor } from '../hooks/useAiMentor';
import {
  AI_ROLES,
  getSelectedModel,
  setSelectedModel,
  fetchAvailableModels,
} from '../utils/aiService';

const ROLE_SUGGESTIONS = {
  tutor: [
    'Объясни эту тему на кошках и пицце 🍕',
    'В чём главная практическая суть?',
    'Покажи минимальный пример кода',
  ],
  reviewer: [
    'Проверь мой код на чистоту и PEP 8',
    'Есть ли здесь скрытые баги или уязвимости?',
    'Как оптимизировать эту функцию?',
  ],
  error_explainer: [
    'Что означает этот Traceback простыми словами?',
    'В какой строке произошла ошибка и почему?',
    'Подскажи, что нужно исправить',
  ],
  interviewer: [
    'Задай мне вопрос по Python и FastAPI',
    'Оцени мой предыдущий ответ по шкале 1-5',
    'Спроси меня про базы данных и SQLAlchemy',
  ],
  navigator: [
    'Что мне делать дальше в курсе?',
    'На чём сфокусироваться сегодня?',
    'Какие темы мне стоит повторить?',
  ],
  practice_generator: [
    'Сгенерируй интересную задачу по текущей теме',
    'Дай практическое упражнение с проверкой assert',
    'Придумай задачу про бэкенд интернет-магазина',
  ],
  english_companion: [
    'Hi Alex! Let me explain a bug I found today.',
    'Could you please review my pull request?',
    'Let’s practice a quick daily standup update.',
  ],
};

export default function AiMentorWidget() {
  const {
    isOpen,
    activeRole,
    messages,
    isLoading,
    showKeyModal,
    setShowKeyModal,
    openMentor,
    closeMentor,
    switchRole,
    sendMessage,
    clearChat,
    roleMeta,
  } = useAiMentor();

  const [inputVal, setInputVal] = useState('');
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [modelId, setModelId] = useState(getSelectedModel());
  const [modelSearch, setModelSearch] = useState('');
  const [models, setModels] = useState([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsError, setModelsError] = useState('');
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Загружаем список моделей OpenRouter при первом открытии настроек
  useEffect(() => {
    if (!showKeyModal || models.length > 0 || modelsLoading) return;
    setModelsLoading(true);
    setModelsError('');
    fetchAvailableModels().then((res) => {
      if (res.ok) {
        setModels(res.models || []);
      } else {
        setModelsError(res.error || 'Не удалось загрузить список моделей');
      }
      setModelsLoading(false);
    });
  }, [showKeyModal, models.length, modelsLoading]);

  const handlePickModel = (id) => {
    setModelId(id);
    setSelectedModel(id);
  };

  const filteredModels = models.filter((m) =>
    (m.name + ' ' + m.id).toLowerCase().includes(modelSearch.toLowerCase())
  );

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputVal.trim() || isLoading) return;
    const text = inputVal.trim();
    setInputVal('');
    sendMessage(text);
  };

  const handleSuggestionClick = (sugText) => {
    sendMessage(sugText);
  };

  const suggestions = ROLE_SUGGESTIONS[activeRole] || ROLE_SUGGESTIONS.tutor;

  return (
    <>
      {/* Плавающая круглая кнопка запуска (Floating Action Button) */}
      {!isOpen && (
        <button
          onClick={() => openMentor({ role: activeRole })}
          className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition hover:scale-110 active:scale-95 group focus:outline-none"
          style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)',
          }}
          title="Открыть единого AI-наставника"
          aria-label="Открыть AI-наставника"
        >
          <span className="text-2xl transition-transform group-hover:rotate-12">🤖</span>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
          </span>
        </button>
      )}

      {/* Панель чата AI-наставника */}
      {isOpen && (
        <div
          className="fixed inset-x-0 bottom-0 z-50 flex h-[88vh] max-h-[640px] w-full flex-col overflow-hidden border shadow-2xl animate-fade-in sm:inset-x-auto sm:right-6 sm:bottom-6 sm:h-[600px] sm:w-[420px] sm:rounded-3xl"
          style={{
            background: 'var(--bg)',
            borderColor: 'var(--border)',
          }}
        >
          {/* Шапка панели */}
          <div
            className="flex items-center justify-between border-b px-4 py-3"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--bg-secondary)',
            }}
          >
            {/* Селектор роли */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu((v) => !v)}
                className="flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold transition hover:bg-[var(--bg-hover)]"
                style={{
                  borderColor: 'var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--text-primary)',
                }}
              >
                <span className="text-base">{roleMeta.icon}</span>
                <span className="truncate max-w-[140px]">{roleMeta.title}</span>
                <span className="text-[10px] opacity-60">▼</span>
              </button>

              {/* Выпадающее меню всех 7 ролей */}
              {showRoleMenu && (
                <div
                  className="absolute left-0 top-full mt-1.5 z-50 w-64 rounded-2xl border p-1.5 shadow-2xl animate-fade-in"
                  style={{
                    background: 'var(--bg)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground" style={{ color: 'var(--text-muted)' }}>
                    Выбери роль AI-наставника:
                  </div>
                  {Object.values(AI_ROLES).map((role) => {
                    const isSelected = role.id === activeRole;
                    return (
                      <button
                        key={role.id}
                        onClick={() => {
                          switchRole(role.id);
                          setShowRoleMenu(false);
                        }}
                        className="flex w-full items-start gap-2.5 rounded-xl p-2 text-left text-xs transition hover:bg-[var(--bg-hover)]"
                        style={{
                          background: isSelected ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : 'transparent',
                        }}
                      >
                        <span className="text-lg">{role.icon}</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold truncate" style={{ color: isSelected ? 'var(--accent)' : 'var(--text-primary)' }}>
                            {role.title}
                          </p>
                          <p className="text-[10px] truncate" style={{ color: 'var(--text-secondary)' }}>
                            {role.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Кнопки управления (Очистить, Настройки, Закрыть) */}
            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-xs transition hover:bg-[var(--bg-hover)]"
                style={{ color: 'var(--text-muted)' }}
                title="Очистить историю диалога"
              >
                🧹
              </button>
              <button
                onClick={() => setShowKeyModal(true)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-xs transition hover:bg-[var(--bg-hover)]"
                style={{ color: 'var(--text-muted)' }}
                title="Настройки API-ключа"
              >
                ⚙️
              </button>
              <button
                onClick={closeMentor}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-base font-bold transition hover:bg-[var(--bg-hover)]"
                style={{ color: 'var(--text-muted)' }}
                title="Свернуть виджет"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Описание текущей роли */}
          <div className="border-b px-4 py-1.5 text-[11px]" style={{ borderColor: 'var(--border)', background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>
            <span>{roleMeta.icon} <strong>{roleMeta.badge}:</strong> {roleMeta.description}</span>
          </div>

          {/* Тело сообщений */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-500/10 text-3xl mb-3">
                  {roleMeta.icon}
                </div>
                <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {roleMeta.title}
                </h3>
                <p className="mt-1 max-w-[280px] text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {roleMeta.description}. Задай любой вопрос или выбери быструю подсказку:
                </p>

                {/* Чипсы быстрых подсказок */}
                <div className="mt-4 flex flex-col gap-1.5 w-full max-w-xs">
                  {suggestions.map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestionClick(sug)}
                      className="rounded-xl border p-2 text-left text-xs font-medium transition hover:scale-[1.01] hover:border-[var(--accent)]"
                      style={{
                        background: 'var(--bg-secondary)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      👉 {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, idx) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div
                  key={idx}
                  className={`flex gap-2.5 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                >
                  {isAssistant && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-sm">
                      {roleMeta.icon}
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed whitespace-pre-wrap ${
                      isAssistant
                        ? msg.isWarning
                          ? 'border border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : msg.isError
                          ? 'border border-red-500/40 bg-red-500/10 text-red-500'
                          : 'border shadow-sm'
                        : 'text-white'
                    }`}
                    style={
                      isAssistant && !msg.isWarning && !msg.isError
                        ? {
                            background: 'var(--bg-secondary)',
                            borderColor: 'var(--border)',
                            color: 'var(--text-primary)',
                          }
                        : !isAssistant
                        ? { background: 'var(--accent)' }
                        : {}
                    }
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs italic" style={{ color: 'var(--text-muted)' }}>
                <span className="animate-spin text-sm">⏳</span>
                <span>{roleMeta.title} думает над ответом...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Быстрые чипсы над полем ввода (если уже есть сообщения) */}
          {messages.length > 0 && (
            <div className="flex overflow-x-auto gap-1.5 px-3 py-1.5 border-t" style={{ borderColor: 'var(--border)' }}>
              {suggestions.slice(0, 2).map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestionClick(sug)}
                  className="shrink-0 rounded-lg border px-2.5 py-1 text-[10px] font-medium transition hover:bg-[var(--bg-hover)]"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                >
                  {sug}
                </button>
              ))}
            </div>
          )}

          {/* Поле ввода */}
          <form onSubmit={handleSend} className="border-t p-3" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={`Спроси ${roleMeta.title}...`}
                className="flex-1 rounded-xl border px-3.5 py-2.5 text-xs outline-none transition"
                style={{
                  background: 'var(--bg)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
              <button
                type="submit"
                disabled={!inputVal.trim() || isLoading}
                className="min-h-[38px] rounded-xl px-3.5 py-2 text-xs font-bold text-white transition hover:brightness-110 disabled:opacity-40"
                style={{ background: 'var(--accent)' }}
              >
                ➤
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Модальное окно настроек AI-наставника */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div
            className="w-full max-w-md rounded-3xl border p-6 shadow-2xl"
            style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
          >
            <div className="mb-3 flex items-center gap-2.5">
              <span className="text-2xl">⚙️</span>
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                Настройки AI-наставника
              </h3>
            </div>

            <p className="mb-4 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              API-ключ настроен через переменную окружения <code>OPENROUTER_API_KEY</code> на сервере.
            </p>

            {/* Выбор модели / провайдера через OpenRouter */}
            <div className="mb-4">
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Модель AI (OpenRouter)
              </label>

              <div
                className="mb-1.5 rounded-xl border px-3 py-2 text-xs font-mono"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              >
                {modelId}
              </div>

              <input
                type="text"
                placeholder="Поиск модели (например: gpt, claude, deepseek)..."
                value={modelSearch}
                onChange={(e) => setModelSearch(e.target.value)}
                className="w-full rounded-xl border p-2.5 text-xs outline-none mb-1.5"
                style={{
                  background: 'var(--bg-secondary)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              />

              <div
                className="max-h-40 overflow-y-auto rounded-xl border"
                style={{ borderColor: 'var(--border)' }}
              >
                {modelsLoading && (
                  <div className="p-3 text-xs italic" style={{ color: 'var(--text-muted)' }}>
                    ⏳ Загружаю список моделей...
                  </div>
                )}
                {modelsError && (
                  <div className="p-3 text-xs" style={{ color: '#ef4444' }}>
                    ❌ {modelsError}
                  </div>
                )}
                {!modelsLoading && !modelsError && filteredModels.length === 0 && (
                  <div className="p-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                    Ничего не найдено
                  </div>
                )}
                {filteredModels.slice(0, 100).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handlePickModel(m.id)}
                    className="flex w-full flex-col items-start gap-0 px-3 py-2 text-left text-xs transition hover:bg-[var(--bg-hover)]"
                    style={{
                      background: m.id === modelId ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : 'transparent',
                      color: m.id === modelId ? 'var(--accent)' : 'var(--text-primary)',
                    }}
                  >
                    <span className="font-bold">{m.name}</span>
                    <span className="text-[10px] opacity-60 font-mono">{m.id}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="min-h-[38px] rounded-xl px-4 py-2 text-xs font-bold text-white transition"
                style={{ background: 'var(--accent)' }}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
