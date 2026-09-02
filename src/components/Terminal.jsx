import { useEffect, useRef, useState } from 'react';
import { createTerminalSession } from '../utils/terminalSimulator';

function Dots() {
  return (
    <div className="flex gap-1.5">
      <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
      <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
      <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
    </div>
  );
}

function toneColor(tone) {
  if (tone === 'success') return 'var(--term-success)';
  if (tone === 'error') return 'var(--term-error)';
  if (tone === 'muted') return 'var(--term-muted)';
  return 'var(--term-text)';
}

function OutputLines({ lines }) {
  return lines.map((l, i) => (
    <pre key={i} className="whitespace-pre-wrap break-words" style={{ color: toneColor(l.tone) }}>
      {l.text}
    </pre>
  ));
}

/**
 * Интерактивный терминал: пользователь печатает команду, терминал "отвечает" так,
 * как ответил бы настоящий терминал на компьютере (это имитация, не реальное выполнение).
 *
 * Если передан проп `script`, терминал переключается в режим пошагового сценария —
 * ученик кликает "Дальше", команды выполняются по одной в заданном порядке.
 */
export default function Terminal({ title = 'Терминал', lessonCommands = {}, suggestions = [], script, welcome }) {
  const [session] = useState(() => createTerminalSession());

  const [history, setHistory] = useState(() =>
    welcome ? [{ kind: 'welcome', lines: welcome.split('\n').map((t) => ({ text: t, tone: 'muted' })) }] : []
  );
  const [input, setInput] = useState('');
  const [stepIndex, setStepIndex] = useState(0);
  const bodyRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [history]);

  function runCommand(cmd) {
    const promptBefore = session.prompt();
    const result = session.execute(cmd, lessonCommands);
    if (result.clear) {
      setHistory([]);
      return;
    }
    setHistory((prev) => [...prev, { kind: 'entry', prompt: promptBefore, command: cmd, lines: result.lines }]);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim()) return;
    runCommand(input);
    setInput('');
  }

  function handleSuggestion(cmd) {
    setInput(cmd);
    inputRef.current?.focus();
  }

  function handleNextStep() {
    if (!script || stepIndex >= script.length) return;
    const step = script[stepIndex];
    // Прогоняем через ту же сессию, что и интерактивный ввод — так (venv) в приглашении
    // и список установленных пакетов остаются согласованными на всём сценарии урока.
    const promptBefore = session.prompt();
    // Если автор урока не задал конкретный вывод — используем обычный симулятор
    // (реалистичный лог pip install / uvicorn и т.д.), а не пустую строку.
    const override = step.output !== undefined ? { [step.command]: { output: step.output, type: step.type } } : {};
    const result = session.execute(step.command, override);
    setHistory((prev) => [...prev, { kind: 'entry', prompt: promptBefore, command: step.command, lines: result.lines }]);
    setStepIndex((i) => i + 1);
  }

  function handleCopy() {
    const text = history
      .map((h) => {
        if (h.kind === 'welcome') return h.lines.map((l) => l.text).join('\n');
        return [`${h.prompt} ${h.command}`, ...h.lines.map((l) => l.text)].join('\n');
      })
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
        <button
          onClick={handleCopy}
          className="rounded-md px-2 py-1 text-xs font-medium transition hover:opacity-80"
          style={{ color: 'var(--term-muted)' }}
        >
          Копировать
        </button>
      </div>

      <div
        ref={bodyRef}
        onClick={() => inputRef.current?.focus()}
        className="max-h-80 min-h-[7rem] cursor-text overflow-y-auto px-4 py-3 font-mono text-[13px] leading-relaxed"
      >
        {history.map((h, i) => (
          <div key={i} className="mb-1.5">
            {h.kind === 'entry' && (
              <div>
                <span style={{ color: 'var(--term-prompt)' }}>{h.prompt}</span>{' '}
                <span style={{ color: 'var(--term-text)' }}>{h.command}</span>
              </div>
            )}
            <OutputLines lines={h.lines} />
          </div>
        ))}

        {script ? (
          stepIndex < script.length && (
            <button
              onClick={handleNextStep}
              className="mt-1 rounded-md border px-3 py-1.5 text-xs font-semibold transition hover:opacity-90"
              style={{ borderColor: 'var(--term-border)', color: 'var(--term-success)' }}
            >
              ▶ Дальше: {script[stepIndex].command}
            </button>
          )
        ) : (
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <span style={{ color: 'var(--term-prompt)' }}>{session.prompt()}</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
              autoComplete="off"
              placeholder="напиши команду и нажми Enter..."
              className="flex-1 bg-transparent font-mono text-[13px] outline-none"
              style={{ color: 'var(--term-text)' }}
            />
            <span className="animate-cursor-blink" style={{ color: 'var(--term-text)' }}>
              ▍
            </span>
          </form>
        )}
      </div>

      {!script && suggestions.length > 0 && (
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
