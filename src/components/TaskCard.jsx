import { useState } from 'react';
import Hint from './Hint';
import CodeBlock from './CodeBlock';

const DIFFICULTY = {
  easy: { label: 'Легко', bg: '--accent-soft-bg', text: '--accent-soft-text', border: '--accent-soft-border' },
  medium: { label: 'Средне', bg: '--warning-soft-bg', text: '--warning-soft-text', border: '--warning-soft-border' },
  hard: { label: 'Сложно', bg: '--danger-soft-bg', text: '--danger-soft-text', border: '--danger-soft-border' },
};

export default function TaskCard({ task }) {
  const [showSolution, setShowSolution] = useState(false);
  const diff = DIFFICULTY[task.difficulty] || DIFFICULTY.easy;

  return (
    <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>
          {task.title}
        </h4>
        <span
          className="rounded-full border px-2 py-0.5 text-[11px] font-medium"
          style={{ background: `var(${diff.bg})`, color: `var(${diff.text})`, borderColor: `var(${diff.border})` }}
        >
          {diff.label}
        </span>
      </div>
      <p className="mb-3 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        {task.description}
      </p>

      {task.hints?.length > 0 && (
        <div className="mb-2 space-y-2">
          {task.hints.map((hint, i) => (
            <Hint key={i} index={i + 1} text={hint} />
          ))}
        </div>
      )}

      {task.solution && (
        <div className="mt-3">
          {!showSolution ? (
            <button
              onClick={() => setShowSolution(true)}
              className="text-xs font-medium underline decoration-dotted underline-offset-4 hover:opacity-80"
              style={{ color: 'var(--accent)' }}
            >
              Показать решение
            </button>
          ) : (
            <div>
              <button
                onClick={() => setShowSolution(false)}
                className="mb-2 text-xs font-medium hover:opacity-80"
                style={{ color: 'var(--text-muted)' }}
              >
                Скрыть решение
              </button>
              <CodeBlock code={task.solution} lang="python" title="Возможное решение" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
