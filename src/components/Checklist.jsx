import { useState } from 'react';
import { loadJSON, saveJSON } from '../utils/storage';

export default function Checklist({ lessonId, items }) {
  const key = `checklist:${lessonId}`;
  const [checked, setChecked] = useState(() => new Set(loadJSON(key, [])));

  function toggle(i) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      saveJSON(key, Array.from(next));
      return next;
    });
  }

  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i}>
          <label className="flex cursor-pointer items-start gap-2.5 text-sm" style={{ color: 'var(--text-primary)' }}>
            <input
              type="checkbox"
              checked={checked.has(i)}
              onChange={() => toggle(i)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded"
              style={{ accentColor: 'var(--accent)' }}
            />
            <span style={checked.has(i) ? { color: 'var(--text-muted)', textDecoration: 'line-through' } : undefined}>
              {item}
            </span>
          </label>
        </li>
      ))}
    </ul>
  );
}
