import { useState } from 'react';
import { runPython, isPyodideLoaded } from '../utils/pyodideRunner';
import { reviewPythonCode } from '../utils/aiService';
import { useAiMentor } from '../hooks/useAiMentor';

export default function Sandbox({ initialCode, bootstrap, description }) {
  const [code, setCode] = useState(initialCode);
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | loading | running
  const [hasRun, setHasRun] = useState(false);

  const { openMentor } = useAiMentor();

  // AI Review local state:
  const [aiStatus, setAiStatus] = useState('idle'); // idle | loading | success | error | no_key
  const [aiReview, setAiReview] = useState(null);
  const [aiError, setAiError] = useState('');

  async function handleRun() {
    setStatus(isPyodideLoaded() ? 'running' : 'loading');
    const result = await runPython(code, {
      bootstrap,
      onStatus: (s) => setStatus(s === 'ready' ? 'running' : 'loading'),
    });
    setLogs(result);
    setHasRun(true);
    setStatus('idle');
  }

  function handleReset() {
    setCode(initialCode);
    setLogs([]);
    setHasRun(false);
    setAiReview(null);
    setAiStatus('idle');
  }

  async function handleAiReview() {
    setAiStatus('loading');
    setAiError('');
    setAiReview(null);

    const outputText = logs.map((l) => l.text).join('\n');
    const errorEntry = logs.find((l) => l.type === 'error');
    const errorText = errorEntry ? errorEntry.text : '';

    const res = await reviewPythonCode({
      code,
      description,
      output: outputText,
      error: errorText,
    });

    if (res.ok) {
      setAiReview(res.message);
      setAiStatus('success');
    } else if (res.code === 'NO_API_KEY') {
      setAiStatus('no_key');
      setAiError(res.error || 'AI-функция временно недоступна, добавьте API-ключ в настройках');
    } else {
      setAiStatus('error');
      setAiError(res.error || 'Не удалось получить ответ от AI');
    }
  }

  function handleExplainError(errText) {
    openMentor({
      role: 'error_explainer',
      initialMessage: `При запуске этого кода возникла ошибка:\n${errText}\n\nОбъясни мне простыми словами, что случилось, почему и как это исправить?`,
      context: `Код в песочнице:\n\`\`\`python\n${code}\n\`\`\`\n\nТекст ошибки (Traceback):\n${errText}\n\nОписание задания:\n${description || 'Упражнение'}`,
      autoSend: true,
    });
  }

  const running = status !== 'idle';
  const aiLoading = aiStatus === 'loading';
  const hasError = logs.some((l) => l.type === 'error');
  const errorEntry = logs.find((l) => l.type === 'error');

  return (
    <div className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <span className="text-lg">🐍</span>
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Песочница Python
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleReset}
            className="min-h-[36px] rounded-md px-2.5 py-1.5 text-xs font-medium transition hover:bg-[var(--bg-hover)]"
            style={{ color: 'var(--text-secondary)' }}
          >
            Сбросить
          </button>

          <button
            onClick={handleAiReview}
            disabled={aiLoading}
            className="min-h-[36px] flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition hover:brightness-110 disabled:opacity-60"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              color: '#ffffff',
            }}
          >
            <span>🤖</span>
            <span>{aiLoading ? 'Анализируем код...' : 'Проверить с AI'}</span>
          </button>

          <button
            onClick={handleRun}
            disabled={running}
            className="min-h-[36px] rounded-md px-3 py-1.5 text-xs font-semibold transition disabled:opacity-60"
            style={{ background: 'var(--accent)', color: 'var(--accent-contrast)' }}
          >
            {status === 'loading' ? 'Загружаем Python...' : status === 'running' ? 'Выполняется...' : '▶ Запустить'}
          </button>
        </div>
      </div>

      {description && (
        <p className="border-b px-4 py-2.5 text-xs leading-relaxed" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
          {description}
        </p>
      )}

      {status === 'loading' && (
        <div className="border-b px-4 py-2 text-xs" style={{ borderColor: 'var(--border)', color: 'var(--info)' }}>
          Загружаем настоящий Python прямо в браузер — это происходит один раз и занимает 10–30 секунд.
          Дальше все уроки будут запускаться мгновенно.
        </div>
      )}

      {/* Панель обратной связи AI-ревьюера */}
      {aiStatus !== 'idle' && (
        <div
          className="border-b p-4 text-xs transition animate-fade-in"
          style={{
            background: aiStatus === 'no_key' ? 'color-mix(in srgb, var(--warning) 10%, var(--bg-secondary))' : 'var(--bg-hover)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-bold" style={{ color: 'var(--text-primary)' }}>
              <span>🤖</span> Наставник по коду:
            </span>
            <button
              onClick={() => setAiStatus('idle')}
              className="text-xs transition hover:opacity-75"
              style={{ color: 'var(--text-muted)' }}
            >
              ✕ Закрыть
            </button>
          </div>

          {aiLoading && (
            <div className="flex items-center gap-2 font-medium" style={{ color: 'var(--accent)' }}>
              <span className="animate-spin">⏳</span> AI анализирует архитектуру и стиль твоего кода...
            </div>
          )}

          {aiStatus === 'success' && aiReview && (
            <div className="whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              {aiReview}
            </div>
          )}

          {aiStatus === 'no_key' && (
            <div className="space-y-2">
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                ⚠️ {aiError}
              </p>
              <p style={{ color: 'var(--text-secondary)' }}>
                Для работы AI-функций добавьте ключ OpenRouter в переменную окружения <code>OPENROUTER_API_KEY</code> на сервере.
              </p>
            </div>
          )}

          {aiStatus === 'error' && (
            <p style={{ color: 'var(--danger)' }}>
              ❌ {aiError}
            </p>
          )}
        </div>
      )}

      <div className="grid gap-px md:grid-cols-2" style={{ background: 'var(--border)' }}>
        <div style={{ background: 'var(--code-bg)' }}>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="h-64 sm:h-72 w-full resize-none p-4 font-mono text-[13px] leading-relaxed outline-none"
            style={{ background: 'var(--code-bg)', color: 'var(--text-primary)' }}
          />
        </div>
        <div
          className="flex h-64 sm:h-72 flex-col justify-between overflow-y-auto p-4 font-mono text-[13px] leading-relaxed"
          style={{ background: 'var(--code-bg)' }}
        >
          <div className="space-y-1">
            {!hasRun && !running && <span style={{ color: 'var(--text-muted)' }}>Нажми «Запустить», чтобы увидеть вывод print() здесь</span>}
            {hasRun && logs.length === 0 && (
              <span style={{ color: 'var(--text-muted)' }}>Код выполнен, но ничего не выведено (нет print())</span>
            )}
            {logs.map((entry, i) => (
              <pre
                key={i}
                className="whitespace-pre-wrap break-words"
                style={{ color: entry.type === 'error' ? 'var(--danger)' : 'var(--text-primary)' }}
              >
                {entry.type === 'error' ? '✗ ' : '›'} {entry.text}
              </pre>
            ))}
          </div>

          {/* Кнопка "Объяснить эту ошибку с AI" */}
          {hasError && errorEntry && (
            <div className="mt-3 pt-2 border-t border-red-500/20">
              <button
                onClick={() => handleExplainError(errorEntry.text)}
                className="min-h-[34px] flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-500/20"
              >
                <span>🔍</span>
                <span>Объяснить эту ошибку с AI</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
