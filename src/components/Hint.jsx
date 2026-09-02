import { useState } from 'react';

export default function Hint({ index, text }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm transition hover:opacity-80"
        style={{ color: 'var(--text-secondary)' }}
      >
        <span>💡 Подсказка {index}</span>
        <span className={`transition-transform ${open ? 'rotate-180' : ''}`}>⌄</span>
      </button>
      {open && (
        <p className="border-t px-3 py-2.5 text-sm leading-relaxed" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
          {text}
        </p>
      )}
    </div>
  );
}
