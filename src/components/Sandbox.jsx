import { useState } from 'react';
import { runPython, isPyodideLoaded } from '../utils/pyodideRunner';

export default function Sandbox({ initialCode, bootstrap, description }) {
  const [code, setCode] = useState(initialCode);
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | loading | running
  const [hasRun, setHasRun] = useState(false);

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
  }

  const running = status !== 'idle';

  return (
    <div className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
      <div className="flex items-center justify-between border-b px-4 py-2.5" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <span className="text-lg">🐍</span>
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Песочница Python
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="rounded-md px-3 py-1.5 text-xs font-medium transition hover:bg-[var(--bg-hover)]"
            style={{ color: 'var(--text-secondary)' }}
          >
            Сбросить
          </button>
          <button
            onClick={handleRun}
            disabled={running}
            className="rounded-md px-3 py-1.5 text-xs font-semibold transition disabled:opacity-60"
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

      <div className="grid gap-px md:grid-cols-2" style={{ background: 'var(--border)' }}>
        <div style={{ background: 'var(--code-bg)' }}>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="h-72 w-full resize-none p-4 font-mono text-[13px] leading-relaxed outline-none"
            style={{ background: 'var(--code-bg)', color: 'var(--text-primary)' }}
          />
        </div>
        <div
          className="flex h-72 flex-col overflow-y-auto p-4 font-mono text-[13px] leading-relaxed"
          style={{ background: 'var(--code-bg)' }}
        >
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
      </div>
    </div>
  );
}
