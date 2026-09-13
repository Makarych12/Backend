import { useEffect, useRef, useState } from 'react';
import { VirtualShell } from '../utils/virtualShell';

function Dots() {
  return (
    <div className="flex gap-1.5">
      <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
      <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
      <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
    </div>
  );
}

/**
 * Виртуальный Linux-терминал. В отличие от Terminal.jsx здесь команды выполняются
 * по-настоящему — маленьким интерпретатором (VirtualShell) поверх файловой системы в памяти.
 * Ученик печатает что угодно; после каждой команды вызывается onStateChange(shell),
 * чтобы урок мог проверить результат (состояние ФС, процессы, вывод). После кнопки
 * «Сбросить» вызывается onStateChange(freshShell, { reset: true }).
 *
 * `initialFs` — стартовое дерево файлов (формат описан в utils/virtualShell.js),
 * `processes` — необязательный список фейковых процессов для ps/top/kill,
 * `cwd` — стартовый каталог (по умолчанию /home/user).
 */
export default function LinuxTerminal({
  title = 'Linux-терминал',
  initialFs,
  processes,
  cwd,
  welcome,
  suggestions = [],
  onStateChange,
}) {
  const [shell, setShell] = useState(() => new VirtualShell(initialFs, { processes, cwd }));
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [histIndex, setHistIndex] = useState(-1);
  const bodyRef = useRef(null);
  const inputRef = useRef(null);
  const onStateChangeRef = useRef(onStateChange);

  useEffect(() => {
    onStateChangeRef.current = onStateChange;
  }, [onStateChange]);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [history]);

  function runCommand(cmd) {
    const promptBefore = shell.prompt();
    const res = shell.run(cmd);
    if (res.clear) {
      setHistory([]);
    } else {
      setHistory((prev) => [...prev, { prompt: promptBefore, command: cmd, output: res.output, error: res.error }]);
    }
    onStateChangeRef.current?.(shell);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim()) {
      setHistory((prev) => [...prev, { prompt: shell.prompt(), command: '', output: '', error: null }]);
      return;
    }
    runCommand(input);
    setInput('');
    setHistIndex(-1);
  }

  // Стрелки вверх/вниз листают историю команд — как в настоящем терминале.
  function handleKeyDown(e) {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    const hist = shell.history;
    if (hist.length === 0) return;
    e.preventDefault();
    let next = histIndex;
    if (e.key === 'ArrowUp') next = histIndex === -1 ? hist.length - 1 : Math.max(0, histIndex - 1);
    else next = histIndex === -1 ? -1 : histIndex + 1 >= hist.length ? -1 : histIndex + 1;
    setHistIndex(next);
    setInput(next === -1 ? '' : hist[next]);
  }

  function handleReset() {
    const fresh = new VirtualShell(initialFs, { processes, cwd });
    setShell(fresh);
    setHistory([]);
    setInput('');
    setHistIndex(-1);
    onStateChangeRef.current?.(fresh, { reset: true });
    inputRef.current?.focus();
  }

  function handleSuggestion(cmd) {
    setInput(cmd);
    inputRef.current?.focus();
  }

  function handleCopy() {
    const text = history
      .map((h) => [`${h.prompt} ${h.command}`, h.output, h.error].filter(Boolean).join('\n'))
      .join('\n');
    navigator.clipboard?.writeText(text).catch(() => {});
  }

  return (
    <div
      className="overflow-hidden rounded-xl border"
      style={{ borderColor: 'var(--term-border)', background: 'var(--term-bg)' }}
    >
      <div
        className="flex items-center justify-between border-b px-4 py-2.5"
        style={{ borderColor: 'var(--term-border)', background: 'var(--term-header)' }}
      >
        <div className="flex items-center gap-3">
          <Dots />
          <span className="text-xs font-medium" style={{ color: 'var(--term-muted)' }}>
            {title}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="rounded-md px-2 py-1 text-xs font-medium transition hover:opacity-80"
            style={{ color: 'var(--term-muted)' }}
          >
            Копировать
          </button>
          <button
            onClick={handleReset}
            title="Вернуть файлы и процессы в исходное состояние"
            className="rounded-md px-2 py-1 text-xs font-medium transition hover:opacity-80"
            style={{ color: 'var(--term-muted)' }}
          >
            ↺ Сбросить
          </button>
        </div>
      </div>

      <div
        ref={bodyRef}
        onClick={() => inputRef.current?.focus()}
        className="max-h-96 min-h-[9rem] cursor-text overflow-y-auto px-4 py-3 font-mono text-[13px] leading-relaxed"
      >
        {welcome && (
          <pre className="mb-2 whitespace-pre-wrap break-words" style={{ color: 'var(--term-muted)' }}>
            {welcome}
          </pre>
        )}
        {history.map((h, i) => (
          <div key={i} className="mb-1">
            <div>
              <span style={{ color: 'var(--term-prompt)' }}>{h.prompt}</span>{' '}
              <span style={{ color: 'var(--term-text)' }}>{h.command}</span>
            </div>
            {h.output && (
              <pre className="whitespace-pre-wrap break-words" style={{ color: 'var(--term-text)' }}>
                {h.output}
              </pre>
            )}
            {h.error && (
              <pre className="whitespace-pre-wrap break-words" style={{ color: 'var(--term-error)' }}>
                {h.error}
              </pre>
            )}
          </div>
        ))}

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <span className="shrink-0" style={{ color: 'var(--term-prompt)' }}>
            {shell.prompt()}
          </span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            placeholder="напиши команду и нажми Enter..."
            className="flex-1 bg-transparent font-mono text-[13px] outline-none"
            style={{ color: 'var(--term-text)' }}
          />
          <span className="animate-cursor-blink" style={{ color: 'var(--term-text)' }}>
            ▍
          </span>
        </form>
      </div>

      {suggestions.length > 0 && (
        <div
          className="flex flex-wrap gap-1.5 border-t px-4 py-2.5"
          style={{ borderColor: 'var(--term-border)', background: 'var(--term-header)' }}
        >
          {suggestions.map((cmd) => (
            <button
              key={cmd}
              onClick={() => handleSuggestion(cmd)}
              className="rounded-md border px-2 py-1 font-mono text-[11px] transition hover:opacity-80"
              style={{ borderColor: 'var(--term-border)', color: 'var(--term-muted)' }}
            >
              {cmd}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
